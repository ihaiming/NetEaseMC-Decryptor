'use strict'

import $ from './jquery-4.0.0.esm.min.js'

// ======== 国际化 (i18n) 设置 ========
let currentLang = localStorage.getItem('lang') || 'zh';

const lang = {
    zh: {
        // UI 界面
        app_title: 'Minecraft 网易版存档解密工具',
        upload_title: '拖拽 ZIP 文件到此处或',
        btn_browse_zip: '选择 ZIP 文件',
        btn_browse_folder: '选择文件夹',
        api_note_unsupported: '⚠️ 当前浏览器不支持文件夹选择功能，请使用ZIP文件上传功能',
        file_info_empty: '未选择文件',
        progress_title: '处理进度',
        status_waiting: '等待操作...',
        btn_start_decrypt: '开始解密',
        btn_download: '下载解密后的存档',
        dialog_headline: '操作提醒',
        dialog_welcome: '本站可以一键解密网易版MC存档且完全开源，感谢您的使用！',
        dialog_warning_title: '重要提醒：',
        dialog_warning_1: '使用 <b>"选择文件夹"</b> 功能解密时，会直接覆盖原文件！请务必备份您的存档，特别是 <code>存档/db</code> 目录！',
        dialog_warning_2: '解密过程完全在浏览器本地进行，文件绝不会上传到服务器，保护隐私。',
        dialog_warning_3: '选择ZIP文件解密时，请将 <code>存档/db</code> 目录下的全部文件压缩后上传，不要压缩整个存档大目录。压缩级别建议选 <b>"仅存储"</b>。',
        dialog_path_title: '存档位置：',
        dialog_path_mobile: '<b>手机端：</b><br><code>/storage/emulated/0/Android/data/com.netease.x19/files/minecraftWorlds/</code><br>这里的com.netease.x19如果是从官网下的一般是这个如果不是长按应用图标 → 应用详情 → 点击应用包名',
        dialog_path_pc: '<b>电脑端（Java版）：</b> 开始游戏 → 选择游戏 → 直接导出到本地',
        btn_understood: '我已了解',
        footer_github: 'Github',
        footer_deploy: '部署同款项目',

        // JavaScript 动态提示
        js_reading_zip: '正在读取ZIP文件...',
        js_analyzing: '分析存档结构...',
        js_getting_key: '正在获取解密密钥...',
        js_decrypting: '开始解密文件...',
        js_generating_zip: '正在生成解密后的ZIP文件...',
        js_scanning_folder: '正在扫描文件夹...',
        js_reading_enc: '正在读取加密信息...',
        js_folder_done: '文件夹解密完成！',
        js_initializing: '正在初始化...',
        js_done: '解密完成！',
        js_done_success: '✓ 解密已成功完成！',
        js_process_fail: '处理失败',
        js_ready: 'ZIP文件已准备就绪，点击"开始解密"按钮',
        js_folder_selected: '已选择文件夹。<br><span class="text-error">警告：解密会直接覆盖原文件，请确保已备份！</span>',
        js_btn_processing: '正在处理...',

        // 错误信息
        err_no_file: '没有选择文件',
        err_read_zip: '读取ZIP文件失败',
        err_no_current: '找不到CURRENT文件',
        err_no_manifest: '找不到MANIFEST文件',
        err_read_current: '读取CURRENT文件失败',
        err_not_encrypted: '存档未加密或使用旧版加密',
        err_detail: '错误详情:',
        err_hint_current: '错误：未找到CURRENT文件，请确保是有效的网易版存档或目录是"存档/db"',
        err_hint_manifest: '错误：未找到MANIFEST文件，请确保是有效的网易版存档或目录是"存档/db"',
        err_hint_unencrypted: '错误：该存档未加密或使用不支持的加密格式',
        err_hint_zip_corrupt: '错误：读取ZIP文件失败，文件可能已损坏',
        err_upload_zip_only: '错误：请上传ZIP格式的存档文件<br>支持的文件格式: .zip',
        err_upload_zip_plain: '错误：请上传ZIP格式的存档文件',
        err_file_type: '文件类型错误',
        err_select_fail: '文件选择失败',
        err_fs_unsupported: '当前浏览器不支持文件夹选择API',
        err_folder_missing_files: '错误：选择的文件夹中缺少 CURRENT 或 MANIFEST 文件，请确保这是网易版MC存档目录或目录是 "存档/db"',
        err_folder_invalid: '文件夹无效：缺少必要文件',
        err_folder_select_fail: '选择文件夹失败: ',
        err_cancel: '用户取消选择',
        err_security: '安全限制，请检查浏览器权限',

        // 拼接词
        word_selected: '已选择',
        word_selected_folder: '已选择文件夹',
        word_files: '个文件',
        word_processing_file: '正在处理文件'
    },
    en: {
        // UI
        app_title: 'Minecraft NetEase Save Decryptor',
        upload_title: 'Drag & Drop ZIP file here or',
        btn_browse_zip: 'Select ZIP File',
        btn_browse_folder: 'Select Folder',
        api_note_unsupported: '⚠️ Folder selection is not supported in this browser. Please upload a ZIP file.',
        file_info_empty: 'No file selected',
        progress_title: 'Progress',
        status_waiting: 'Waiting for operation...',
        btn_start_decrypt: 'Start Decryption',
        btn_download: 'Download Decrypted Save',
        dialog_headline: 'Important Notice',
        dialog_welcome: 'This tool can decrypt NetEase Minecraft saves with one click. It is completely open-source. Thanks for using!',
        dialog_warning_title: 'Warning:',
        dialog_warning_1: 'When using <b>"Select Folder"</b>, original files will be overwritten! Please backup your save, especially the <code>db</code> folder!',
        dialog_warning_2: 'Decryption is done locally in your browser. Files are never uploaded to any server, ensuring your privacy.',
        dialog_warning_3: 'When selecting a ZIP file, please compress all files inside the <code>db</code> folder, not the parent folder. Set compression level to <b>"Store"</b>.',
        dialog_path_title: 'Save Locations:',
        dialog_path_mobile: '<b>Mobile:</b><br><code>/storage/emulated/0/Android/data/com.netease.x19/files/minecraftWorlds/</code>',
        dialog_path_pc: '<b>PC (Java Edition):</b> Start Game → Select Game → Export to local',
        btn_understood: 'I Understand',
        footer_github: 'Github',
        footer_deploy: 'Deploy this project',

        // JavaScript Dynamic
        js_reading_zip: 'Reading ZIP file...',
        js_analyzing: 'Analyzing save structure...',
        js_getting_key: 'Extracting decryption key...',
        js_decrypting: 'Decrypting files...',
        js_generating_zip: 'Generating decrypted ZIP...',
        js_scanning_folder: 'Scanning folder...',
        js_reading_enc: 'Reading encryption info...',
        js_folder_done: 'Folder decryption completed!',
        js_initializing: 'Initializing...',
        js_done: 'Decryption completed!',
        js_done_success: '✓ Decryption completed successfully!',
        js_process_fail: 'Processing failed',
        js_ready: 'ZIP file ready, click "Start Decryption"',
        js_folder_selected: 'Folder selected.<br><span class="text-error">Warning: Files will be overwritten. Make sure you have backups!</span>',
        js_btn_processing: 'Processing...',

        // Errors
        err_no_file: 'No file selected',
        err_read_zip: 'Failed to read ZIP file',
        err_no_current: 'CURRENT file not found',
        err_no_manifest: 'MANIFEST file not found',
        err_read_current: 'Failed to read CURRENT file',
        err_not_encrypted: 'Save is not encrypted or uses old encryption',
        err_detail: 'Error details:',
        err_hint_current: 'Error: CURRENT file missing. Ensure it is a valid NetEase save or the folder is "db"',
        err_hint_manifest: 'Error: MANIFEST file missing. Ensure it is a valid NetEase save or the folder is "db"',
        err_hint_unencrypted: 'Error: Save is not encrypted or uses unsupported format',
        err_hint_zip_corrupt: 'Error: Failed to read ZIP, file might be corrupted',
        err_upload_zip_only: 'Error: Please upload a ZIP file<br>Supported format: .zip',
        err_upload_zip_plain: 'Error: Please upload a ZIP file',
        err_file_type: 'Invalid file type',
        err_select_fail: 'Failed to select file',
        err_fs_unsupported: 'Browser does not support File System API',
        err_folder_missing_files: 'Error: Missing CURRENT or MANIFEST in selected folder.',
        err_folder_invalid: 'Invalid folder: Missing required files',
        err_folder_select_fail: 'Failed to select folder: ',
        err_cancel: 'User cancelled',
        err_security: 'Security restriction, please check browser permissions',

        // Conjunctions
        word_selected: 'Selected',
        word_selected_folder: 'Selected folder',
        word_files: 'files',
        word_processing_file: 'Processing file'
    }
};

export const t = (key) => {
    return lang[currentLang][key] || key;
};

export const switchLanguage = (lang) => {
    currentLang = lang;
    localStorage.setItem('mc_decryptor_lang', lang);
    i18n();
};

export const i18n = () => {
    // 更新带有 data-i18n 属性的标签
    $('[data-i18n]').each(function () {
        const key = $(this).attr('data-i18n');
        if (this.tagName === 'TITLE') {
            document.title = t(key);
        } else {
            $(this).html(t(key));
        }
    });

    // 同步更新 HTML 的 lang 属性
    $('html').attr('lang', currentLang === 'zh' ? 'zh-cn' : 'en');
};