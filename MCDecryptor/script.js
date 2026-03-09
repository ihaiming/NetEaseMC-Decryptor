'use strict'
import $ from './jquery-4.0.0.esm.min.js'
import { i18n, switchLanguage, t } from './i18n.js'

// ======== 核心常量与状态 ========
const ENCRYPTION_HEADER = new Uint8Array([0x80, 0x1D, 0x30, 0x01]);
const TEXT_ENCODER = new TextEncoder();
const IS_FS_API_SUPPORTED = 'showDirectoryPicker' in window;

const state = {
    currentFile: null,
    directoryHandle: null,
    useFileSystemAPI: false,
    isProcessing: false,
    downloadUrl: null
};

// ======== jQuery 元素缓存 ========
let $els = {};

// ======== UI 与 工具函数 ========
const setStatusHtml = (html) => $els.status.html(html);
const setStatusText = (text) => $els.status.text(text);

const showError = (htmlMsg, snackbarMsg) => {
    const plainText = snackbarMsg || htmlMsg.replace(/<[^>]*>?/gm, '');
    setStatusHtml(`<span class="text-error">${htmlMsg}</span>`);
    mdui.snackbar({
        message: plainText,
        placement: 'top',
        closeable: true,
        duration: 5000
    });
};

const showSuccess = (htmlMsg, snackbarMsg) => {
    const plainText = snackbarMsg || htmlMsg.replace(/<[^>]*>?/gm, '');
    setStatusHtml(`<span class="text-success">${htmlMsg}</span>`);
    mdui.snackbar({
        message: plainText,
        placement: 'top',
        duration: 3000
    });
};

const updateProgress = (percent, message) => {
    const percentValue = Math.min(100, Math.max(0, percent));
    $els.progressBar.prop('value', percentValue);
    $els.progressText.text(`${Math.round(percentValue)}%`);

    if (message) {
        setStatusHtml(`${message}<br><br>${t('progress_title')}: ${Math.round(percentValue)}%`);
    }
};

const resetDownload = () => {
    if (state.downloadUrl) {
        URL.revokeObjectURL(state.downloadUrl);
        state.downloadUrl = null;
    }
    $els.downloadBtn.hide().addClass('hidden-btn');
};

const setProcessing = (isProcessing) => {
    state.isProcessing = isProcessing;
    $els.processBtn
        .prop('disabled', isProcessing)
        .html(isProcessing ? t('js_btn_processing') : t('btn_start_decrypt'));
};

const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
};

// ======== 核心解密算法 (保持不变) ========
const checkHeader = (fileData, header) =>
    fileData.length >= header.length && header.every((byte, i) => fileData[i] === byte);

const xor = (data, key) => {
    const result = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
        result[i] = data[i] ^ key[i % key.length];
    }
    return result;
};

const optimizeKey = (key) => {
    if (key.length === 16) {
        const firstHalf = key.slice(0, 8);
        const secondHalf = key.slice(8, 16);
        const isSame = firstHalf.every((byte, i) => byte === secondHalf[i]);
        if (isSame) return firstHalf;
    }
    return key;
};

const getKey = async (currentFileData, manifestName) => {
    const encryptedData = currentFileData.slice(4);
    const manifestBytes = TEXT_ENCODER.encode(manifestName);
    const source = new Uint8Array(manifestBytes.length + 1);
    source.set(manifestBytes);
    source[manifestBytes.length] = 0x0A;
    const key = xor(encryptedData, source);
    return optimizeKey(key);
};

const decryptFile = (fileData, key) => {
    const encryptedData = fileData.slice(4);
    return xor(encryptedData, key);
};

// ======== 核心业务处理逻辑 ========
const processZipFile = async () => {
    if (!state.currentFile) throw new Error(t('err_no_file'));
    updateProgress(5, t('js_reading_zip'));

    let zip;
    try {
        zip = await window.JSZip.loadAsync(state.currentFile);
    } catch (zipError) {
        throw new Error(`${t('err_read_zip')}: ${zipError.message}`);
    }

    updateProgress(15, t('js_analyzing'));

    let currentFileEntry = null;
    let manifestFileEntry = null;
    const fileList = [];

    zip.forEach((relativePath, zipEntry) => {
        if (zipEntry.dir) return;
        fileList.push(zipEntry);
        if (relativePath === 'CURRENT') currentFileEntry = zipEntry;
        else if (relativePath.startsWith('MANIFEST')) manifestFileEntry = zipEntry;
    });

    if (!currentFileEntry) throw new Error(t('err_no_current'));
    if (!manifestFileEntry) throw new Error(t('err_no_manifest'));

    updateProgress(25, t('js_getting_key'));

    let currentFileData;
    try {
        currentFileData = await currentFileEntry.async('uint8array');
    } catch (readError) {
        throw new Error(`${t('err_read_current')}: ${readError.message}`);
    }

    if (!checkHeader(currentFileData, ENCRYPTION_HEADER)) {
        throw new Error(t('err_not_encrypted'));
    }

    const key = await getKey(currentFileData, manifestFileEntry.name);
    updateProgress(35, t('js_decrypting'));

    const newZip = new window.JSZip();
    let processedFiles = 0;
    const totalFiles = fileList.length;

    for (const zipEntry of fileList) {
        try {
            const fileData = await zipEntry.async('uint8array');
            if (checkHeader(fileData, ENCRYPTION_HEADER)) {
                newZip.file(zipEntry.name, decryptFile(fileData, key));
            } else {
                newZip.file(zipEntry.name, fileData);
            }
            processedFiles++;
            updateProgress(35 + (processedFiles / totalFiles) * 55, `${t('word_processing_file')}: ${processedFiles}/${totalFiles}`);
        } catch (fileError) {
            console.warn(`Error on ${zipEntry.name}:`, fileError);
        }
    }

    updateProgress(95, t('js_generating_zip'));

    const content = await newZip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
    });

    const url = URL.createObjectURL(content);
    state.downloadUrl = url;

    $els.downloadBtn.attr({
        href: url,
        download: state.currentFile.name.replace('.zip', '_decrypted.zip') || 'mc_decrypted.zip'
    });
};

const processDirectory = async () => {
    if (!state.directoryHandle) throw new Error(t('err_no_file'));
    updateProgress(5, t('js_scanning_folder'));

    let currentFileHandle = null;
    let manifestFileHandle = null;
    const fileHandles = [];

    for await (const entry of state.directoryHandle.values()) {
        if (entry.kind === 'file') {
            fileHandles.push(entry);
            if (entry.name === 'CURRENT') currentFileHandle = entry;
            if (entry.name.startsWith('MANIFEST')) manifestFileHandle = entry;
        }
    }

    if (!currentFileHandle) throw new Error(t('err_no_current'));
    if (!manifestFileHandle) throw new Error(t('err_no_manifest'));

    updateProgress(15, t('js_reading_enc'));

    const currentFile = await currentFileHandle.getFile();
    const currentFileData = new Uint8Array(await currentFile.arrayBuffer());

    if (!checkHeader(currentFileData, ENCRYPTION_HEADER)) {
        throw new Error(t('err_not_encrypted'));
    }

    updateProgress(25, t('js_getting_key'));
    const key = await getKey(currentFileData, manifestFileHandle.name);

    updateProgress(35, t('js_decrypting'));

    let processedFiles = 0;
    const totalFiles = fileHandles.length;

    for (const fileHandle of fileHandles) {
        try {
            const file = await fileHandle.getFile();
            const fileData = new Uint8Array(await file.arrayBuffer());

            if (checkHeader(fileData, ENCRYPTION_HEADER)) {
                const decryptedData = decryptFile(fileData, key);
                const writable = await fileHandle.createWritable();
                await writable.write(decryptedData);
                await writable.close();
            }

            processedFiles++;
            updateProgress(35 + (processedFiles / totalFiles) * 55, `${t('word_processing_file')}: ${processedFiles}/${totalFiles}`);
        } catch (fileError) {
            console.warn(`Error on ${fileHandle.name}:`, fileError);
        }
    }
    updateProgress(100, t('js_folder_done'));
};

// ======== 用户交互事件处理器 ========
const startProcessing = async () => {
    if ((!state.currentFile && !state.directoryHandle) || state.isProcessing) return;

    setProcessing(true);
    updateProgress(0, t('js_initializing'));

    try {
        if (state.useFileSystemAPI) {
            await processDirectory();
        } else {
            await processZipFile();
        }

        updateProgress(100, t('js_done'));
        showSuccess(t('js_done_success'));

        if (!state.useFileSystemAPI) {
            $els.downloadBtn.css('display', 'flex').removeClass('hidden-btn');
            $els.downloadBtn[0].scrollIntoView({ behavior: 'smooth', block: 'end' });
        }

    } catch (error) {
        console.error('Processing error:', error);
        let errorDetail = `${t('err_detail')} ${error.message}`;

        if (error.message.includes('CURRENT') || error.message.includes(t('err_no_current'))) errorDetail = t('err_hint_current');
        else if (error.message.includes('MANIFEST') || error.message.includes(t('err_no_manifest'))) errorDetail = t('err_hint_manifest');
        else if (error.message.includes('加密') || error.message.includes('encrypted')) errorDetail = t('err_hint_unencrypted');
        else if (error.message.includes('ZIP')) errorDetail = t('err_hint_zip_corrupt');

        showError(errorDetail);
        updateProgress(0, t('js_process_fail'));
    } finally {
        setProcessing(false);
    }
};

const handleFileSelect = (file) => {
    try {
        const isZipFile = file.type === 'application/zip' || file.name.toLowerCase().endsWith('.zip');

        if (!isZipFile) {
            showError(t('err_upload_zip_only'), t('err_upload_zip_plain'));
            $els.fileInfo.text(`${t('err_file_type')}: ${file.name}`);

            $els.uploadArea.addClass('error-border');
            setTimeout(() => $els.uploadArea.removeClass('error-border'), 3000);

            $els.processBtn.prop('disabled', true);
            return;
        }

        $els.uploadArea.removeClass('error-border');
        state.currentFile = file;
        $els.fileInfo.text(`${t('word_selected')}: ${file.name} (${formatFileSize(file.size)})`);
        $els.processBtn.prop('disabled', false);
        setStatusText(t('js_ready'));
        resetDownload();

    } catch (error) {
        console.error('File select error:', error);
        showError(`${t('err_detail')} ${error.message}`);
        $els.fileInfo.text(t('err_select_fail'));
        $els.processBtn.prop('disabled', true);
    }
};

const selectDirectory = async () => {
    try {
        if (!IS_FS_API_SUPPORTED) throw new Error(t('err_fs_unsupported'));

        state.directoryHandle = await window.showDirectoryPicker();
        state.useFileSystemAPI = true;

        let hasCurrent = false;
        let hasManifest = false;
        let fileCount = 0;

        for await (const entry of state.directoryHandle.values()) {
            if (entry.kind === 'file') {
                fileCount++;
                if (entry.name === 'CURRENT') hasCurrent = true;
                if (entry.name.startsWith('MANIFEST')) hasManifest = true;
            }
        }

        if (!hasCurrent || !hasManifest) {
            showError(t('err_folder_missing_files'), t('err_folder_invalid'));
            $els.fileInfo.text(t('err_folder_invalid'));
            $els.processBtn.prop('disabled', true);
            return;
        }

        $els.fileInfo.text(`${t('word_selected_folder')}: ${state.directoryHandle.name} (${fileCount}${t('word_files')})`);
        $els.processBtn.prop('disabled', false);
        setStatusHtml(t('js_folder_selected'));
        resetDownload();

    } catch (error) {
        console.error('Select folder error:', error);
        let errorMsg = t('err_folder_select_fail');
        if (error.name === 'AbortError') errorMsg += t('err_cancel');
        else if (error.name === 'SecurityError') errorMsg += t('err_security');
        else if (error.message.includes('not supported')) errorMsg += t('err_fs_unsupported');
        else errorMsg += error.message;

        showError(errorMsg);
        $els.fileInfo.text(t('err_select_fail'));
        $els.processBtn.prop('disabled', true);
    }
};

// ======== 初始化与事件绑定 ========
$(function () {
    $els = {
        uploadArea: $('#uploadArea'),
        fileInput: $('#fileInput'),
        browseBtn: $('#browseBtn'),
        fsApiBtn: $('#fsApiBtn'),
        apiNoteContainer: $('#apiNoteContainer'),
        fileInfo: $('#fileInfo'),
        processBtn: $('#processBtn'),
        status: $('#status'),
        progressBar: $('#progressBar'),
        progressText: $('#progressText'),
        downloadBtn: $('#downloadBtn'),
        aboutBtn: $('#aboutBtn'),
        aboutDialog: $('#aboutDialog'),
        langMenu: $('#langMenu')
    };

    // 初始化多语言文本
    i18n($els);

    // 绑定语言切换事件
    $els.langMenu.find('mdui-menu-item').on('click', function () {
        switchLanguage($(this).attr('data-lang'));

        // 如果没有选中任何文件，刷新状态提示
        if (!state.currentFile && !state.directoryHandle) {
            setStatusText(t('status_waiting'));
            $els.fileInfo.text(t('file_info_empty'));
        }
    });

    if (IS_FS_API_SUPPORTED) {
        $els.fsApiBtn.css('display', 'inline-flex').removeClass('hidden-btn');
    } else {
        $('<div/>', {
            class: 'api-note warning-text',
            'data-i18n': 'api_note_unsupported',
            html: t('api_note_unsupported')
        }).appendTo($els.apiNoteContainer);
    }

    $els.aboutBtn.on('click', () => $els.aboutDialog.prop('open', true));
    setTimeout(() => $els.aboutDialog.prop('open', true));

    $els.browseBtn.on('click', () => {
        $els.fileInput.val('').trigger('click');
    });

    $els.fsApiBtn.on('click', selectDirectory);

    $els.fileInput.on('change', (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            state.useFileSystemAPI = false;
            handleFileSelect(files[0]);
        }
    });

    $els.uploadArea
        .on('dragover', (e) => {
            e.preventDefault();
            $els.uploadArea.addClass('dragover');
        })
        .on('dragleave', () => {
            $els.uploadArea.removeClass('dragover');
        })
        .on('drop', (e) => {
            e.preventDefault();
            $els.uploadArea.removeClass('dragover');

            const files = e.originalEvent.dataTransfer.files;
            if (files.length > 0) {
                state.useFileSystemAPI = false;
                handleFileSelect(files[0]);
            }
        });

    $els.processBtn.on('click', startProcessing);
});