'use strict'
import $ from './jquery-4.0.0.esm.min.js'

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

// ======== jQuery 元素缓存 (等 DOM 加载完后再获取) ========
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

    // MDUI Web Components 通常使用 prop 设置属性
    $els.progressBar.prop('value', percentValue);
    $els.progressText.text(`${Math.round(percentValue)}%`);

    if (message) {
        setStatusHtml(`${message}<br><br>当前进度: ${Math.round(percentValue)}%`);
    }
};

const resetDownload = () => {
    if (state.downloadUrl) {
        URL.revokeObjectURL(state.downloadUrl);
        state.downloadUrl = null;
    }
    // jQuery 链式操作隐藏按钮
    $els.downloadBtn.hide().addClass('hidden-btn');
};

const setProcessing = (isProcessing) => {
    state.isProcessing = isProcessing;
    $els.processBtn
        .prop('disabled', isProcessing)
        .text(isProcessing ? '正在处理...' : '开始解密');
};

const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
};

// ======== 核心解密算法 ========
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
    if (!state.currentFile) throw new Error('没有选择文件');
    updateProgress(5, '正在读取ZIP文件...');

    let zip;
    try {
        zip = await window.JSZip.loadAsync(state.currentFile);
    } catch (zipError) {
        throw new Error(`读取ZIP文件失败: ${zipError.message}`);
    }

    updateProgress(15, '分析存档结构...');

    let currentFileEntry = null;
    let manifestFileEntry = null;
    const fileList = [];

    zip.forEach((relativePath, zipEntry) => {
        if (zipEntry.dir) return;
        fileList.push(zipEntry);
        if (relativePath === 'CURRENT') currentFileEntry = zipEntry;
        else if (relativePath.startsWith('MANIFEST')) manifestFileEntry = zipEntry;
    });

    if (!currentFileEntry) throw new Error('找不到CURRENT文件');
    if (!manifestFileEntry) throw new Error('找不到MANIFEST文件');

    updateProgress(25, '正在获取解密密钥...');

    let currentFileData;
    try {
        currentFileData = await currentFileEntry.async('uint8array');
    } catch (readError) {
        throw new Error(`读取CURRENT文件失败: ${readError.message}`);
    }

    if (!checkHeader(currentFileData, ENCRYPTION_HEADER)) {
        throw new Error('存档未加密或使用旧版加密');
    }

    const key = await getKey(currentFileData, manifestFileEntry.name);
    updateProgress(35, '开始解密文件...');

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
            updateProgress(35 + (processedFiles / totalFiles) * 55, `正在处理文件: ${processedFiles}/${totalFiles}`);
        } catch (fileError) {
            console.warn(`处理文件 ${zipEntry.name} 时出错:`, fileError);
        }
    }

    updateProgress(95, '正在生成解密后的ZIP文件...');

    const content = await newZip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
    });

    const url = URL.createObjectURL(content);
    state.downloadUrl = url;

    // jQuery 批量设置属性
    $els.downloadBtn.attr({
        href: url,
        download: state.currentFile.name.replace('.zip', '_decrypted.zip') || 'mc_decrypted.zip'
    });
};

const processDirectory = async () => {
    if (!state.directoryHandle) throw new Error('没有选择文件夹');
    updateProgress(5, '正在扫描文件夹...');

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

    if (!currentFileHandle) throw new Error('找不到CURRENT文件');
    if (!manifestFileHandle) throw new Error('找不到MANIFEST文件');

    updateProgress(15, '正在读取加密信息...');

    const currentFile = await currentFileHandle.getFile();
    const currentFileData = new Uint8Array(await currentFile.arrayBuffer());

    if (!checkHeader(currentFileData, ENCRYPTION_HEADER)) {
        throw new Error('存档未加密或使用旧版加密');
    }

    updateProgress(25, '正在获取解密密钥...');
    const key = await getKey(currentFileData, manifestFileHandle.name);

    updateProgress(35, '开始解密文件...');

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
            updateProgress(35 + (processedFiles / totalFiles) * 55, `正在处理文件: ${processedFiles}/${totalFiles}`);
        } catch (fileError) {
            console.warn(`处理文件 ${fileHandle.name} 时出错:`, fileError);
        }
    }
    updateProgress(100, '文件夹解密完成！');
};

// ======== 用户交互事件处理器 ========
const startProcessing = async () => {
    if ((!state.currentFile && !state.directoryHandle) || state.isProcessing) return;

    setProcessing(true);
    updateProgress(0, '正在初始化...');

    try {
        if (state.useFileSystemAPI) {
            await processDirectory();
        } else {
            await processZipFile();
        }

        updateProgress(100, '解密完成！');
        showSuccess('✓ 解密已成功完成！', '解密已成功完成！');

        if (!state.useFileSystemAPI) {
            $els.downloadBtn.css('display', 'flex').removeClass('hidden-btn');
            $els.downloadBtn[0].scrollIntoView({ behavior: 'smooth', block: 'end' });
        }

    } catch (error) {
        console.error('处理过程错误:', error);
        let errorDetail = `错误详情: ${error.message}`;

        if (error.message.includes('找不到CURRENT')) errorDetail = '错误：未找到CURRENT文件，请确保是有效的网易版存档或目录是"存档/db"';
        else if (error.message.includes('找不到MANIFEST')) errorDetail = '错误：未找到MANIFEST文件，请确保是有效的网易版存档或目录是"存档/db"';
        else if (error.message.includes('未加密')) errorDetail = '错误：该存档未加密或使用不支持的加密格式';
        else if (error.message.includes('ZIP文件')) errorDetail = '错误：读取ZIP文件失败，文件可能已损坏';

        showError(errorDetail);
        updateProgress(0, '处理失败');
    } finally {
        setProcessing(false);
    }
};

const handleFileSelect = (file) => {
    try {
        const isZipFile = file.type === 'application/zip' || file.name.toLowerCase().endsWith('.zip');

        if (!isZipFile) {
            showError('错误：请上传ZIP格式的存档文件<br>支持的文件格式: .zip', '错误：请上传ZIP格式的存档文件');
            $els.fileInfo.text(`文件类型错误: ${file.name}`);

            $els.uploadArea.addClass('error-border');
            setTimeout(() => $els.uploadArea.removeClass('error-border'), 3000);

            $els.processBtn.prop('disabled', true);
            return;
        }

        $els.uploadArea.removeClass('error-border');
        state.currentFile = file;
        $els.fileInfo.text(`已选择: ${file.name} (${formatFileSize(file.size)})`);
        $els.processBtn.prop('disabled', false);
        setStatusText('ZIP文件已准备就绪，点击"开始解密"按钮');
        resetDownload();

    } catch (error) {
        console.error('文件选择错误:', error);
        showError(`错误: ${error.message}`);
        $els.fileInfo.text('文件选择失败');
        $els.processBtn.prop('disabled', true);
    }
};

const selectDirectory = async () => {
    try {
        if (!IS_FS_API_SUPPORTED) throw new Error('当前浏览器不支持文件夹选择API');

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
            showError('错误：选择的文件夹中缺少 CURRENT 或 MANIFEST 文件，请确保这是网易版MC存档目录或目录是 "存档/db"', '选择的文件夹中缺少必要文件');
            $els.fileInfo.text('文件夹无效：缺少必要文件');
            $els.processBtn.prop('disabled', true);
            return;
        }

        $els.fileInfo.text(`已选择文件夹: ${state.directoryHandle.name} (${fileCount}个文件)`);
        $els.processBtn.prop('disabled', false);
        setStatusHtml('已选择文件夹。<br><span class="text-error">警告：解密会直接覆盖原文件，请确保已备份！</span>');
        resetDownload();

    } catch (error) {
        console.error('选择文件夹错误:', error);
        let errorMsg = '选择文件夹失败: ';
        if (error.name === 'AbortError') errorMsg += '用户取消选择';
        else if (error.name === 'SecurityError') errorMsg += '安全限制，请检查浏览器权限';
        else if (error.message.includes('not supported')) errorMsg += '浏览器不支持此功能';
        else errorMsg += error.message;

        showError(errorMsg);
        $els.fileInfo.text('选择文件夹失败');
        $els.processBtn.prop('disabled', true);
    }
};

// ======== jQuery 初始化与事件绑定 ========
$(function () {
    // 缓存 jQuery 对象
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
        aboutDialog: $('#aboutDialog')
    };

    if (IS_FS_API_SUPPORTED) {
        $els.fsApiBtn.css('display', 'inline-flex').removeClass('hidden-btn');
    } else {
        $('<div/>', {
            class: 'api-note warning-text',
            html: '⚠️ 当前浏览器不支持文件夹选择功能，请使用ZIP文件上传功能'
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