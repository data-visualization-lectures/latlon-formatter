// DOM 要素
const fileInput = document.getElementById('fileInput');
const fileUploadArea = document.querySelector('.file-upload-area');
const fileInfo = document.getElementById('fileInfo');
const dataPreview = document.getElementById('dataPreview');
const convertedPreviewSection = document.getElementById('convertedPreviewSection');
const convertedDataPreview = document.getElementById('convertedDataPreview');
const formatSelectionSection = document.getElementById('formatSelectionSection');
const singleColumnSelect = document.getElementById('singleColumnSelect');
const singleColumnLabel = document.getElementById('singleColumnLabel');
const doubleColumnSelection = document.getElementById('doubleColumnSelection');
const latitudeColumn = document.getElementById('latitudeColumn');
const longitudeColumn = document.getElementById('longitudeColumn');
const convertButton = document.getElementById('convertButton');
const downloadButton = document.getElementById('downloadButton');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const loadingIndicator = document.getElementById('loadingIndicator');

// 状態管理
let csvData = null;              // パースされたCSVデータ（全行）
let headers = [];                // CSVヘッダー
let currentFormat = 'single';    // 現在の形式 ('single' or 'double')
let targetFormat = 'double';     // 変換後の形式 ('single' or 'double')
let selectedColumn = null;       // 1列形式の場合の列名
let selectedLatColumn = null;    // 2列形式の場合の緯度列
let selectedLonColumn = null;    // 2列形式の場合の経度列
let editedData = null;           // 編集されたデータ
let convertedHeaders = [];       // 変換後のヘッダー
let uploadedFileName = '';       // アップロードされたファイル名

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    fileInput.addEventListener('change', handleFileSelect);
    fileUploadArea.addEventListener('dragover', handleDragOver);
    fileUploadArea.addEventListener('dragleave', handleDragLeave);
    fileUploadArea.addEventListener('drop', handleFileDrop);

    // ラジオボタンイベント
    document.querySelectorAll('input[name="currentFormat"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentFormat = e.target.value;
            updateColumnSelectionUI();
        });
    });

    document.querySelectorAll('input[name="targetFormat"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            targetFormat = e.target.value;
        });
    });

    convertButton.addEventListener('click', performConvert);
    downloadButton.addEventListener('click', performDownload);
});

// 列選択UIを更新
function updateColumnSelectionUI() {
    if (currentFormat === 'single') {
        singleColumnSelect.style.display = 'block';
        singleColumnLabel.style.display = 'block';
        doubleColumnSelection.style.display = 'none';
    } else {
        singleColumnSelect.style.display = 'none';
        singleColumnLabel.style.display = 'none';
        doubleColumnSelection.style.display = 'block';
    }
}

// ドラッグオーバーハンドラ
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    fileUploadArea.classList.add('drag-over');
}

// ドラッグリーブハンドラ
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    fileUploadArea.classList.remove('drag-over');
}

// ドロップハンドラ
function handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    fileUploadArea.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        handleFileSelect({ target: { files } });
    }
}

// ファイル選択ハンドラ
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length === 0) return;

    const file = files[0];
    clearError();

    try {
        showLoading(true);

        // Papa Parse を使用してCSVをパース
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                console.log('✅ CSV Parse Results:', results);

                if (results.errors && results.errors.length > 0) {
                    console.error('❌ CSV Parse Errors:', results.errors);
                    showError('CSVファイルの解析に失敗しました: ' + results.errors[0].message);
                    showLoading(false);
                    return;
                }

                csvData = results.data || [];
                headers = results.meta.fields || [];
                uploadedFileName = file.name;

                if (csvData.length === 0 || headers.length === 0) {
                    showError('CSVファイルが空です');
                    showLoading(false);
                    return;
                }

                // ファイル情報を表示
                displayFileInfo(file.name, csvData.length, headers);

                // 列の割り当てセクションを表示
                populateColumnSelects(headers);
                formatSelectionSection.style.display = 'block';

                // 初期表示（1列形式を選択）
                currentFormat = 'single';
                targetFormat = 'double';
                updateColumnSelectionUI();

                showLoading(false);
            },
            error: (error) => {
                console.error('❌ Papa Parse Error:', error);
                showError(`CSVパースエラー: ${error.message}`);
                showLoading(false);
            }
        });
    } catch (error) {
        console.error('❌ ファイル処理エラー:', error);
        showError(`ファイル処理エラー: ${error.message}`);
        showLoading(false);
    }
}

// ファイル情報を表示
function displayFileInfo(fileName, rowCount, columnHeaders) {
    let html = `
        <div class="file-info-item">
            <span class="file-info-label">ファイル名:</span> ${fileName}
        </div>
        <div class="file-info-item">
            <span class="file-info-label">行数:</span> ${rowCount}
        </div>
        <div class="file-info-item">
            <span class="file-info-label">列数:</span> ${columnHeaders.length}
        </div>
        <div class="file-info-item">
            <span class="file-info-label">列名:</span> ${columnHeaders.join(', ')}
        </div>
    `;
    fileInfo.innerHTML = html;
    fileInfo.style.display = 'block';

    // データプレビューを表示
    displayDataPreview(columnHeaders, csvData);
}

// データプレビューを表示（最初の5行）
function displayDataPreview(columnHeaders, data) {
    const previewRowCount = 5;
    const rowsToShow = data.slice(0, previewRowCount);

    let html = '<strong style="display: block; margin-bottom: 8px;">データプレビュー（最初の数行）:</strong>';
    html += '<table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">';

    // ヘッダー行
    html += '<thead style="background-color: #f5f5f5;"><tr>';
    columnHeaders.forEach(header => {
        html += `<th style="border: 1px solid #ddd; padding: 6px; text-align: left; font-weight: 600;">${header}</th>`;
    });
    html += '</tr></thead>';

    // データ行
    html += '<tbody>';
    rowsToShow.forEach((row) => {
        html += '<tr>';
        columnHeaders.forEach(header => {
            const cellValue = row[header] || '';
            html += `<td style="border: 1px solid #ddd; padding: 6px;">${cellValue}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody>';

    html += '</table>';

    dataPreview.innerHTML = html;
    dataPreview.style.display = 'block';
}

// 列のドロップダウンを生成
function populateColumnSelects(columns) {
    // 1列形式の座標列選択
    singleColumnSelect.innerHTML = '<option value="">-- 選択 --</option>';
    columns.forEach(col => {
        const option = document.createElement('option');
        option.value = col;
        option.textContent = col;
        singleColumnSelect.appendChild(option);
    });

    // 2列形式の緯度列選択
    latitudeColumn.innerHTML = '<option value="">-- 選択 --</option>';
    columns.forEach(col => {
        const option = document.createElement('option');
        option.value = col;
        option.textContent = col;
        latitudeColumn.appendChild(option);
    });

    // 2列形式の経度列選択
    longitudeColumn.innerHTML = '<option value="">-- 選択 --</option>';
    columns.forEach(col => {
        const option = document.createElement('option');
        option.value = col;
        option.textContent = col;
        longitudeColumn.appendChild(option);
    });

    // 自動検出を試みる
    detectColumns(columns);
}

// 列を自動検出
function detectColumns(columns) {
    const latPatterns = /^(lat|latitude|緯度|ラット)$/i;
    const lonPatterns = /^(lon|longitude|経度|ロン)$/i;

    columns.forEach(col => {
        if (latPatterns.test(col)) {
            latitudeColumn.value = col;
        }
        if (lonPatterns.test(col)) {
            longitudeColumn.value = col;
        }
    });
}

// 形式を変換
function performConvert() {
    clearError();

    try {
        showLoading(true);

        if (currentFormat === 'single') {
            selectedColumn = singleColumnSelect.value;
            if (!selectedColumn) {
                showError('座標列を選択してください');
                showLoading(false);
                return;
            }
        } else {
            selectedLatColumn = latitudeColumn.value;
            selectedLonColumn = longitudeColumn.value;
            if (!selectedLatColumn || !selectedLonColumn) {
                showError('緯度列と経度列を選択してください');
                showLoading(false);
                return;
            }
            if (selectedLatColumn === selectedLonColumn) {
                showError('緯度列と経度列は異なる列を選択してください');
                showLoading(false);
                return;
            }
        }

        // データを変換
        convertData();

        // 変換後のデータをプレビュー表示
        displayConvertedDataPreview();

        showLoading(false);
        clearError();
    } catch (error) {
        console.error('変換エラー:', error);
        showError(`変換エラー: ${error.message}`);
        showLoading(false);
    }
}

// ダウンロード実行
function performDownload() {
    clearError();
    try {
        downloadCSV();
    } catch (error) {
        console.error('ダウンロードエラー:', error);
        showError(`ダウンロードエラー: ${error.message}`);
    }
}

// データを変換
function convertData() {
    editedData = JSON.parse(JSON.stringify(csvData));

    if (currentFormat === 'single' && targetFormat === 'double') {
        // 1列 → 2列に変換
        convertedHeaders = [];
        headers.forEach(header => {
            if (header !== selectedColumn) {
                convertedHeaders.push(header);
            }
        });
        convertedHeaders.push('緯度', '経度');

        editedData = editedData.map(row => {
            const newRow = {};
            headers.forEach(header => {
                if (header !== selectedColumn) {
                    newRow[header] = row[header];
                }
            });

            const coordStr = row[selectedColumn] || '';
            const parts = coordStr.split(',').map(s => s.trim());
            newRow['緯度'] = parts[0] || '';
            newRow['経度'] = parts[1] || '';

            return newRow;
        });
    } else if (currentFormat === 'double' && targetFormat === 'single') {
        // 2列 → 1列に変換
        convertedHeaders = [];
        headers.forEach(header => {
            if (header !== selectedLatColumn && header !== selectedLonColumn) {
                convertedHeaders.push(header);
            }
        });
        convertedHeaders.push('座標');

        editedData = editedData.map(row => {
            const newRow = {};
            headers.forEach(header => {
                if (header !== selectedLatColumn && header !== selectedLonColumn) {
                    newRow[header] = row[header];
                }
            });

            const lat = row[selectedLatColumn] || '';
            const lon = row[selectedLonColumn] || '';
            newRow['座標'] = `${lat},${lon}`;

            return newRow;
        });
    } else {
        // 変換不要
        convertedHeaders = headers;
    }
}

// 変換後のデータをプレビュー表示
function displayConvertedDataPreview() {
    const previewRowCount = 5;
    const rowsToShow = editedData.slice(0, previewRowCount);

    let html = '<table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">';

    // ヘッダー行
    html += '<thead style="background-color: #f5f5f5;"><tr>';
    convertedHeaders.forEach(header => {
        const isCoordinateCol = header === '緯度' || header === '経度' || header === '座標';
        const style = isCoordinateCol ? 'background-color: #fff3e0; font-weight: bold;' : '';
        html += `<th style="border: 1px solid #ddd; padding: 6px; text-align: left; font-weight: 600; ${style}">${header}</th>`;
    });
    html += '</tr></thead>';

    // データ行
    html += '<tbody>';
    rowsToShow.forEach((row) => {
        html += '<tr>';
        convertedHeaders.forEach(header => {
            const cellValue = row[header] || '';
            const isCoordinateCol = header === '緯度' || header === '経度' || header === '座標';
            const style = isCoordinateCol ? 'background-color: #fffbf0;' : '';
            html += `<td style="border: 1px solid #ddd; padding: 6px; ${style}">${cellValue}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody>';

    html += '</table>';

    convertedDataPreview.innerHTML = html;
    convertedPreviewSection.style.display = 'block';

    // ページをスクロール
    setTimeout(() => {
        convertedPreviewSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// CSVをダウンロード
function downloadCSV() {
    if (!editedData || editedData.length === 0) {
        showError('ダウンロードするデータがありません');
        return;
    }

    // 全データを出力（変換済みデータを使用）
    // Papa Parse の unparse 機能を使用
    const csv = Papa.unparse(editedData, {
        header: true,
        newline: '\n'
    });

    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);

    // ファイル名を生成
    const fileNameWithoutExt = uploadedFileName.replace(/\.csv$/i, '');
    const suffix = currentFormat === 'single' && targetFormat === 'double' ? '_2col' : '_1col';
    const fileName = `${fileNameWithoutExt}${suffix}.csv`;

    const link = document.createElement('a');
    link.href = dataUri;
    link.download = fileName;
    link.click();
}

// ローディング表示
function showLoading(show) {
    loadingIndicator.style.display = show ? 'block' : 'none';
}

// エラー表示
function showError(message) {
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
}

// エラーをクリア
function clearError() {
    errorSection.style.display = 'none';
    errorMessage.textContent = '';
}
