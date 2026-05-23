document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // --- State management ---
  const state = {
    currentTab: 'text-tab',
    pastedImageBlob: null,
    pastedImageURL: null,
    base64Data: null
  };

  // --- Element selectors ---
  const navItems = document.querySelectorAll('.nav-item');
  const tabContents = document.querySelectorAll('.tab-content');
  const tabTitle = document.getElementById('current-tab-title');
  const tabDesc = document.getElementById('current-tab-desc');
  const toastContainer = document.getElementById('toast-container');

  // --- Tab config metadata ---
  const tabMetadata = {
    'text-tab': {
      title: 'Paste Text or Code',
      desc: 'Instantly download pasted text or code snippet as a custom file.'
    },
    'image-tab': {
      title: 'Image Clipboard Converter',
      desc: 'Paste images from your clipboard to preview and convert to PNG, JPG, or WebP.'
    },
    'base64-tab': {
      title: 'Base64 Binary Decoder',
      desc: 'Instantly convert Base64 strings back into their original binary files.'
    },
    'svg-tab': {
      title: 'SVG Previewer & PNG Renderer',
      desc: 'Render your raw vector SVGs, preview visually, and export as high-res PNG.'
    },
    'url-tab': {
      title: 'File Downloader from URL',
      desc: 'Fetch and download files directly to your device via link.'
    }
  };

  // --- Toast Notification Helper ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-circle';
    
    toast.innerHTML = `
      <i data-lucide="${iconName}"></i>
      <div class="toast-message">${message}</div>
      <button class="toast-close"><i data-lucide="x"></i></button>
    `;
    
    toastContainer.appendChild(toast);
    if (typeof lucide !== 'undefined') lucide.createIcons({ attrs: { class: 'lucide-icon' } });
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 50);
    
    // Auto remove
    const timer = setTimeout(() => {
      dismissToast(toast);
    }, 4000);
    
    toast.querySelector('.toast-close').addEventListener('click', () => {
      clearTimeout(timer);
      dismissToast(toast);
    });
  }

  function dismissToast(toast) {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }

  // --- Tab Switching Logic ---
  function switchTab(tabId) {
    if (!tabMetadata[tabId]) return;
    
    // Update active nav item
    navItems.forEach(item => {
      if (item.getAttribute('data-tab') === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update active tab contents
    tabContents.forEach(content => {
      if (content.id === tabId) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });

    // Update header textual content
    tabTitle.textContent = tabMetadata[tabId].title;
    tabDesc.textContent = tabMetadata[tabId].desc;
    state.currentTab = tabId;
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      switchTab(item.getAttribute('data-tab'));
    });
  });

  // --- File Download Utility ---
  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Successfully downloaded "${filename}"`, 'success');
  }

  // ==========================================
  // TAB 1: TEXT & CODE ENGINE
  // ==========================================
  const textInput = document.getElementById('text-input');
  const lineNumbers = document.getElementById('line-numbers');
  const textFilename = document.getElementById('text-filename');
  const textExtension = document.getElementById('text-extension');
  const textClearBtn = document.getElementById('text-clear-btn');
  const textDownloadBtn = document.getElementById('text-download-btn');

  // Sync line numbers on editor input
  function updateLineNumbers() {
    const lines = textInput.value.split('\n');
    const lineCount = lines.length || 1;
    let lineHTML = '';
    for (let i = 1; i <= lineCount; i++) {
      lineHTML += `<div>${i}</div>`;
    }
    lineNumbers.innerHTML = lineHTML;
  }

  textInput.addEventListener('input', () => {
    updateLineNumbers();
    autoDetectTextFormat(textInput.value);
  });

  textInput.addEventListener('scroll', () => {
    lineNumbers.scrollTop = textInput.scrollTop;
  });

  // Text Formatter Smart Auto-Detector
  function autoDetectTextFormat(content) {
    if (!content || content.trim() === '') return;
    
    const trimmed = content.trim();
    
    // Check JSON
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        JSON.parse(trimmed);
        textExtension.value = 'json';
        if (textFilename.value === 'snippet') textFilename.value = 'data';
        return;
      } catch (e) {}
    }

    // Check SVG
    if (trimmed.startsWith('<svg') && trimmed.endsWith('</svg>')) {
      // Prompt user or handle. We don't auto-switch immediately during typing, but suggest XML/HTML extension
      textExtension.value = 'xml';
      return;
    }

    // Check HTML
    if (trimmed.toLowerCase().startsWith('<!doctype html') || trimmed.toLowerCase().includes('<html>') || trimmed.toLowerCase().includes('</div>')) {
      textExtension.value = 'html';
      if (textFilename.value === 'snippet') textFilename.value = 'index';
      return;
    }

    // Check Markdown
    if (trimmed.startsWith('# ') || trimmed.includes('\n## ') || trimmed.includes('\n* ') || (trimmed.includes('|') && trimmed.includes('\n|---'))) {
      textExtension.value = 'md';
      if (textFilename.value === 'snippet') textFilename.value = 'README';
      return;
    }

    // Check CSS
    if (trimmed.includes('{') && trimmed.includes('}') && (trimmed.includes(':') || trimmed.includes('margin') || trimmed.includes('color'))) {
      textExtension.value = 'css';
      if (textFilename.value === 'snippet') textFilename.value = 'style';
      return;
    }

    // Check CSV
    if (trimmed.includes(',') && trimmed.split('\n')[0].split(',').length > 1) {
      textExtension.value = 'csv';
      if (textFilename.value === 'snippet') textFilename.value = 'report';
      return;
    }

    // Check Script Languages (Javascript / Python / Shell)
    if (trimmed.includes('const ') || trimmed.includes('let ') || trimmed.includes('function ') || trimmed.includes('console.log(')) {
      textExtension.value = 'js';
      if (textFilename.value === 'snippet') textFilename.value = 'app';
      return;
    }
    
    if (trimmed.includes('def ') || trimmed.includes('import ') || trimmed.includes('print(')) {
      textExtension.value = 'py';
      if (textFilename.value === 'snippet') textFilename.value = 'main';
      return;
    }

    if (trimmed.startsWith('#!/bin/bash') || trimmed.startsWith('#!/bin/sh')) {
      textExtension.value = 'sh';
      if (textFilename.value === 'snippet') textFilename.value = 'script';
      return;
    }
  }

  textClearBtn.addEventListener('click', () => {
    textInput.value = '';
    updateLineNumbers();
    textFilename.value = 'snippet';
    textExtension.value = 'txt';
    showToast('Editor cleared', 'info');
  });

  textDownloadBtn.addEventListener('click', () => {
    const content = textInput.value;
    if (!content) {
      showToast('Please enter some text or code first!', 'error');
      return;
    }

    let filename = textFilename.value.trim() || 'download';
    const ext = textExtension.value;
    
    // Avoid double extension
    if (!filename.endsWith(`.${ext}`)) {
      filename += `.${ext}`;
    }

    let mimeType = 'text/plain';
    if (ext === 'json') mimeType = 'application/json';
    if (ext === 'md') mimeType = 'text/markdown';
    if (ext === 'html') mimeType = 'text/html';
    if (ext === 'css') mimeType = 'text/css';
    if (ext === 'js') mimeType = 'application/javascript';
    if (ext === 'csv') mimeType = 'text/csv';
    if (ext === 'xml') mimeType = 'application/xml';

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    triggerDownload(blob, filename);
  });


  // ==========================================
  // TAB 2: IMAGE OPERATIONS ENGINE
  // ==========================================
  const imageDropzone = document.getElementById('image-dropzone');
  const imagePlaceholder = document.getElementById('image-placeholder');
  const imageDetailsWrapper = document.getElementById('image-details-wrapper');
  const imagePreviewImg = document.getElementById('image-preview-img');
  const imgMetaFormat = document.getElementById('img-meta-format');
  const imgMetaDims = document.getElementById('img-meta-dims');
  const imgMetaSize = document.getElementById('img-meta-size');
  
  const imageExportSettings = document.getElementById('image-export-settings');
  const imageFilename = document.getElementById('image-filename');
  const imageFormatSelect = document.getElementById('image-format-select');
  const imageQualityGroup = document.getElementById('image-quality-group');
  const imageQualitySlider = document.getElementById('image-quality-slider');
  const imageQualityVal = document.getElementById('image-quality-val');
  const imageActions = document.getElementById('image-actions');
  const imageClearBtn = document.getElementById('image-clear-btn');
  const imageDownloadBtn = document.getElementById('image-download-btn');

  // Quality slider label updater
  imageQualitySlider.addEventListener('input', () => {
    imageQualityVal.textContent = `${imageQualitySlider.value}%`;
  });

  // Toggle quality slider depending on selected format
  imageFormatSelect.addEventListener('change', () => {
    const format = imageFormatSelect.value;
    if (format === 'jpeg' || format === 'webp') {
      imageQualityGroup.style.display = 'flex';
    } else {
      imageQualityGroup.style.display = 'none';
    }
  });

  // Process and preview a loaded image file
  function processImageFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Pasted/Dropped file is not a valid image!', 'error');
      return;
    }

    state.pastedImageBlob = file;
    
    // Display file size
    const sizeInKB = (file.size / 1024).toFixed(1);
    imgMetaSize.textContent = `${sizeInKB} KB`;
    imgMetaFormat.textContent = file.type.replace('image/', '').toUpperCase();

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      state.pastedImageURL = e.target.result;
      imagePreviewImg.src = e.target.result;
      
      imagePreviewImg.onload = () => {
        imgMetaDims.textContent = `${imagePreviewImg.naturalWidth} x ${imagePreviewImg.naturalHeight} px`;
      };
      
      // Toggle views
      imagePlaceholder.style.display = 'none';
      imageDetailsWrapper.style.display = 'flex';
      imageExportSettings.style.display = 'grid';
      imageActions.style.display = 'flex';
      
      // Auto-suggest filename based on date/time if simple default
      if (imageFilename.value === 'pasted_image') {
        const dateStr = new Date().toISOString().slice(0,10);
        imageFilename.value = `img_${dateStr}`;
      }

      showToast('Image loaded successfully', 'success');
    };
    reader.readAsDataURL(file);
  }

  // Drag and drop event listeners
  imageDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    imageDropzone.classList.add('dragover');
  });

  imageDropzone.addEventListener('dragleave', () => {
    imageDropzone.classList.remove('dragover');
  });

  imageDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    imageDropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  });

  // Image actions clear
  imageClearBtn.addEventListener('click', () => {
    state.pastedImageBlob = null;
    state.pastedImageURL = null;
    imagePreviewImg.src = '';
    imagePlaceholder.style.display = 'flex';
    imageDetailsWrapper.style.display = 'none';
    imageExportSettings.style.display = 'none';
    imageActions.style.display = 'none';
    imageFilename.value = 'pasted_image';
    showToast('Removed preview image', 'info');
  });

  // Convert & Download handler via Canvas
  imageDownloadBtn.addEventListener('click', () => {
    if (!state.pastedImageURL) return;

    const format = imageFormatSelect.value; // png, jpeg, webp
    const quality = parseFloat(imageQualitySlider.value) / 100;
    let filename = imageFilename.value.trim() || 'pasted_image';
    
    let targetExt = format;
    if (format === 'jpeg') targetExt = 'jpg';
    
    if (!filename.endsWith(`.${targetExt}`)) {
      filename += `.${targetExt}`;
    }

    const canvas = document.getElementById('hidden-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set matching dimensions
    canvas.width = imagePreviewImg.naturalWidth;
    canvas.height = imagePreviewImg.naturalHeight;
    
    // Draw
    ctx.drawImage(imagePreviewImg, 0, 0);

    // Canvas exporter
    let mimeType = `image/${format}`;
    canvas.toBlob((blob) => {
      if (blob) {
        triggerDownload(blob, filename);
      } else {
        showToast('Export failed during conversion!', 'error');
      }
    }, mimeType, format !== 'png' ? quality : undefined);
  });


  // ==========================================
  // TAB 3: BASE64 DECODER ENGINE
  // ==========================================
  const base64Input = document.getElementById('base64-input');
  const base64Filename = document.getElementById('base64-filename');
  const base64Extension = document.getElementById('base64-extension');
  const base64Meta = document.getElementById('base64-meta');
  const base64DetectedMime = document.getElementById('base64-detected-mime');
  const base64DecodedSize = document.getElementById('base64-decoded-size');
  
  const base64ClearBtn = document.getElementById('base64-clear-btn');
  const base64DownloadBtn = document.getElementById('base64-download-btn');

  // Input parser for Base64 formats
  base64Input.addEventListener('input', () => {
    parseBase64(base64Input.value);
  });

  function parseBase64(str) {
    if (!str || str.trim() === '') {
      base64Meta.style.display = 'none';
      return;
    }

    const cleaned = str.trim();
    let rawBase64 = cleaned;
    let mimeType = 'unknown/binary';
    let suggestedExt = 'bin';

    // Parse Data URI headers (e.g. data:image/png;base64,iVBOR...)
    if (cleaned.startsWith('data:')) {
      const match = cleaned.match(/^data:([^;]+);base64,(.*)$/s);
      if (match) {
        mimeType = match[1];
        rawBase64 = match[2];
        
        // Try mapping extensions
        const extParts = mimeType.split('/');
        if (extParts.length > 1) {
          suggestedExt = extParts[1];
          // Handle custom common types
          if (suggestedExt === 'svg+xml') suggestedExt = 'svg';
          if (suggestedExt === 'plain') suggestedExt = 'txt';
          if (suggestedExt === 'javascript') suggestedExt = 'js';
          if (suggestedExt === 'x-zip-compressed') suggestedExt = 'zip';
        }
      }
    }

    // Verify validity of Base64 length & characters
    const safeBase64 = rawBase64.replace(/\s/g, ''); // strip spaces
    
    // Quick validation regex
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    const urlSafeRegex = /^[A-Za-z0-9_-]+=*$/;

    if (!base64Regex.test(safeBase64) && !urlSafeRegex.test(safeBase64)) {
      base64Meta.style.display = 'none';
      return;
    }

    // Estimate size: roughly 3 bytes for every 4 base64 chars
    const sizeBytes = Math.floor((safeBase64.length * 3) / 4) - (safeBase64.endsWith('==') ? 2 : safeBase64.endsWith('=') ? 1 : 0);
    
    let sizeText = `${sizeBytes} bytes`;
    if (sizeBytes > 1024 * 1024) {
      sizeText = `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`;
    } else if (sizeBytes > 1024) {
      sizeText = `${(sizeBytes / 1024).toFixed(1)} KB`;
    }

    // Update fields
    base64DetectedMime.textContent = mimeType;
    base64DecodedSize.textContent = sizeText;
    base64Meta.style.display = 'grid';

    if (suggestedExt !== 'bin') {
      base64Extension.value = suggestedExt;
    }
    
    // Update filename suggestions based on mime types
    if (base64Filename.value === 'decoded_file') {
      if (mimeType.startsWith('image/')) base64Filename.value = 'decoded_image';
      else if (mimeType.includes('pdf')) base64Filename.value = 'decoded_document';
      else if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('gz')) base64Filename.value = 'archive';
    }
  }

  base64ClearBtn.addEventListener('click', () => {
    base64Input.value = '';
    base64Filename.value = 'decoded_file';
    base64Extension.value = 'bin';
    base64Meta.style.display = 'none';
    showToast('Base64 Input cleared', 'info');
  });

  // Base64 Binary Exporter
  base64DownloadBtn.addEventListener('click', () => {
    const inputVal = base64Input.value.trim();
    if (!inputVal) {
      showToast('Please enter a Base64 string first!', 'error');
      return;
    }

    let rawBase64 = inputVal;
    let mimeType = 'application/octet-stream';

    if (inputVal.startsWith('data:')) {
      const match = inputVal.match(/^data:([^;]+);base64,(.*)$/s);
      if (match) {
        mimeType = match[1];
        rawBase64 = match[2];
      }
    }

    // Clean whitespace
    const cleanStr = rawBase64.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/'); // support url safe conversion

    try {
      // Decode using native window.atob
      const byteCharacters = atob(cleanStr);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      let filename = base64Filename.value.trim() || 'decoded_file';
      const ext = base64Extension.value.trim() || 'bin';
      
      if (!filename.endsWith(`.${ext}`)) {
        filename += `.${ext}`;
      }

      triggerDownload(blob, filename);
    } catch (e) {
      showToast('Decoding failed! String is not formatted in valid Base64.', 'error');
    }
  });


  // ==========================================
  // TAB 4: SVG PREVIEWER ENGINE
  // ==========================================
  const svgInput = document.getElementById('svg-input');
  const svgFilename = document.getElementById('svg-filename');
  const svgExportWidth = document.getElementById('svg-export-width');
  const svgExportHeight = document.getElementById('svg-export-height');
  const svgPreviewSection = document.getElementById('svg-preview-section');
  const svgRenderPreview = document.getElementById('svg-render-preview');
  
  const svgClearBtn = document.getElementById('svg-clear-btn');
  const svgDownloadRawBtn = document.getElementById('svg-download-raw-btn');
  const svgDownloadPngBtn = document.getElementById('svg-download-png-btn');

  svgInput.addEventListener('input', () => {
    updateSvgPreview();
  });

  function updateSvgPreview() {
    const rawSvg = svgInput.value.trim();
    if (!rawSvg || !rawSvg.toLowerCase().includes('<svg')) {
      svgPreviewSection.style.display = 'none';
      svgDownloadRawBtn.style.display = 'none';
      svgDownloadPngBtn.style.display = 'none';
      return;
    }

    // Inject preview safely into rendering frame
    svgRenderPreview.innerHTML = rawSvg;
    svgPreviewSection.style.display = 'block';
    svgDownloadRawBtn.style.display = 'inline-flex';
    svgDownloadPngBtn.style.display = 'inline-flex';

    // Auto calculate SVG viewBox / dimensions
    const svgEl = svgRenderPreview.querySelector('svg');
    if (svgEl) {
      // Auto detect dimension preferences
      const viewBox = svgEl.getAttribute('viewBox');
      const w = svgEl.getAttribute('width');
      const h = svgEl.getAttribute('height');

      let parsedW = 512;
      let parsedH = 512;

      if (w && !isNaN(parseInt(w))) {
        parsedW = parseInt(w);
      }
      if (h && !isNaN(parseInt(h))) {
        parsedH = parseInt(h);
      }
      if (viewBox) {
        const parts = viewBox.split(/[\s,]+/);
        if (parts.length === 4) {
          parsedW = parseInt(parts[2]);
          parsedH = parseInt(parts[3]);
        }
      }

      svgExportWidth.value = parsedW;
      svgExportHeight.value = parsedH;
    }
  }

  svgClearBtn.addEventListener('click', () => {
    svgInput.value = '';
    svgRenderPreview.innerHTML = '';
    svgPreviewSection.style.display = 'none';
    svgDownloadRawBtn.style.display = 'none';
    svgDownloadPngBtn.style.display = 'none';
    svgFilename.value = 'vector_graphic';
    showToast('SVG editor cleared', 'info');
  });

  // Export raw SVG file
  svgDownloadRawBtn.addEventListener('click', () => {
    const svgStr = svgInput.value.trim();
    if (!svgStr) return;

    let filename = svgFilename.value.trim() || 'vector';
    if (!filename.endsWith('.svg')) filename += '.svg';

    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    triggerDownload(blob, filename);
  });

  // Export SVG to PNG via Image canvas pipeline
  svgDownloadPngBtn.addEventListener('click', () => {
    const svgStr = svgInput.value.trim();
    if (!svgStr) return;

    const renderW = parseInt(svgExportWidth.value) || 1024;
    const renderH = parseInt(svgExportHeight.value) || 1024;

    let filename = svgFilename.value.trim() || 'vector';
    if (!filename.endsWith('.png')) filename += '.png';

    const svgEl = svgRenderPreview.querySelector('svg');
    if (!svgEl) {
      showToast('Could not find root <svg> element!', 'error');
      return;
    }

    // Set width and height on SVG clone to enforce standard sizing
    const svgClone = svgEl.cloneNode(true);
    svgClone.setAttribute('width', renderW);
    svgClone.setAttribute('height', renderH);
    
    // Ensure XMLSerializer string
    const serializer = new XMLSerializer();
    const svgSerialized = serializer.serializeToString(svgClone);
    
    // Safe base64 utf-8 encoding
    const encodedData = window.btoa(unescape(encodeURIComponent(svgSerialized)));
    const imageURI = `data:image/svg+xml;base64,${encodedData}`;

    const img = new Image();
    img.src = imageURI;

    img.onload = () => {
      const canvas = document.getElementById('hidden-canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = renderW;
      canvas.height = renderH;
      
      // Clear canvas (keeps alpha channel transparent)
      ctx.clearRect(0, 0, renderW, renderH);
      ctx.drawImage(img, 0, 0, renderW, renderH);

      canvas.toBlob((blob) => {
        if (blob) {
          triggerDownload(blob, filename);
        } else {
          showToast('Failed rendering SVG to PNG canvas!', 'error');
        }
      }, 'image/png');
    };

    img.onerror = () => {
      showToast('Renderer failed! Invalid SVG syntax or blocked external resources.', 'error');
    };
  });


  // ==========================================
  // TAB 5: URL DOWNLOAD ENGINE (CORS handles)
  // ==========================================
  const urlInput = document.getElementById('url-input');
  const urlDownloadBtn = document.getElementById('url-download-btn');
  const urlFallbackArea = document.getElementById('url-fallback-area');
  const urlFallbackLink = document.getElementById('url-fallback-link');

  urlDownloadBtn.addEventListener('click', () => {
    const rawUrl = urlInput.value.trim();
    if (!rawUrl) {
      showToast('Please enter a file URL!', 'error');
      return;
    }

    // Verify format
    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
      showToast('Invalid URL protocol. Use http:// or https://', 'error');
      return;
    }

    // Toggle button UI loading
    urlDownloadBtn.disabled = true;
    urlDownloadBtn.innerHTML = '<i data-lucide="loader" class="animate-spin"></i> Fetching...';
    if (typeof lucide !== 'undefined') lucide.createIcons();
    urlFallbackArea.style.display = 'none';

    showToast('Fetching file in background...', 'info');

    fetch(rawUrl)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        
        // Retrieve details
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        
        // Grab filename suggestion from headers or URL
        let filename = 'downloaded_file';
        const disposition = response.headers.get('content-disposition');
        
        if (disposition && disposition.includes('filename=')) {
          const matches = disposition.match(/filename="?([^"]+)"?/);
          if (matches && matches[1]) {
            filename = matches[1];
          }
        } else {
          // parse URL file name
          try {
            const urlObj = new URL(rawUrl);
            const pathParts = urlObj.pathname.split('/');
            const lastPart = pathParts[pathParts.length - 1];
            if (lastPart && lastPart.trim() !== '') {
              filename = decodeURIComponent(lastPart);
            }
          } catch(e) {}
        }

        return response.blob().then(blob => ({ blob, filename }));
      })
      .then(({ blob, filename }) => {
        triggerDownload(blob, filename);
        
        // Reset loading btn
        urlDownloadBtn.disabled = false;
        urlDownloadBtn.innerHTML = '<i data-lucide="download-cloud"></i> Fetch & Download';
        if (typeof lucide !== 'undefined') lucide.createIcons();
      })
      .catch(err => {
        console.error(err);
        showToast('Background fetch failed (usually CORS limits). Showing fallback method.', 'error');
        
        // Trigger fallback interface
        urlFallbackLink.href = rawUrl;
        // Suggest file name based on url suffix in download property
        try {
          const parts = new URL(rawUrl).pathname.split('/');
          urlFallbackLink.download = parts[parts.length - 1] || 'file';
        } catch(e) {}
        
        urlFallbackArea.style.display = 'flex';

        urlDownloadBtn.disabled = false;
        urlDownloadBtn.innerHTML = '<i data-lucide="download-cloud"></i> Fetch & Download';
        if (typeof lucide !== 'undefined') lucide.createIcons();
      });
  });


  // ==========================================
  // GLOBAL KEYBOARD PASTE LISTENER
  // ==========================================
  window.addEventListener('paste', (e) => {
    // Stop interception if user is in an active input area that matches the current tab's direct inputs
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'INPUT')) {
      // Allow standard pasting inside the active textareas
      return;
    }

    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Handle Image Pastes
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        
        // Route to Image Tab
        switchTab('image-tab');
        processImageFile(file);
        return;
      }
      
      // Handle Text Pastes (and routing)
      if (item.type === 'text/plain') {
        item.getAsString((text) => {
          const trimmed = text.trim();
          
          // 1. Route to Base64 tab if matches pattern
          if (trimmed.startsWith('data:') && trimmed.includes(';base64,')) {
            switchTab('base64-tab');
            base64Input.value = text;
            parseBase64(text);
            showToast('Decoded Base64 clipboard pattern detected!', 'success');
            return;
          }
          
          // 2. Route to SVG tab if starts with <svg
          if (trimmed.startsWith('<svg') && trimmed.endsWith('</svg>')) {
            switchTab('svg-tab');
            svgInput.value = text;
            updateSvgPreview();
            showToast('Vector SVG clipboard pattern detected!', 'success');
            return;
          }

          // 3. Route to URL Downloader if URL detected
          if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            switchTab('url-tab');
            urlInput.value = text;
            showToast('File URL clipboard pattern detected!', 'info');
            return;
          }

          // 4. Default: Route to Text Editor
          switchTab('text-tab');
          textInput.value = text;
          updateLineNumbers();
          autoDetectTextFormat(text);
          showToast('Text clipboard imported into editor', 'info');
        });
        return;
      }
    }
  });

  // Global Click Paste Handler (Clipboard API for Mobile & Quick-Action)
  const globalPasteBtn = document.getElementById('global-paste-btn');
  
  if (globalPasteBtn) {
    globalPasteBtn.addEventListener('click', async () => {
      try {
        if (!navigator.clipboard || !navigator.clipboard.read) {
          showToast('Clipboard API not supported. Please paste directly inside input fields.', 'error');
          return;
        }

        const clipboardItems = await navigator.clipboard.read();
        
        for (const item of clipboardItems) {
          // 1. Process Image Paste
          const imageType = item.types.find(type => type.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            const file = new File([blob], "clipboard_image.png", { type: imageType });
            switchTab('image-tab');
            processImageFile(file);
            showToast('Image pasted from clipboard!', 'success');
            return;
          }
          
          // 2. Process Text Paste
          const textType = item.types.find(type => type === 'text/plain');
          if (textType) {
            const blob = await item.getType(textType);
            const text = await blob.text();
            const trimmed = text.trim();
            
            // Route according to content type
            if (trimmed.startsWith('data:') && trimmed.includes(';base64,')) {
              switchTab('base64-tab');
              base64Input.value = text;
              parseBase64(text);
              showToast('Decoded Base64 clipboard pattern detected!', 'success');
              return;
            }
            
            if (trimmed.startsWith('<svg') && trimmed.endsWith('</svg>')) {
              switchTab('svg-tab');
              svgInput.value = text;
              updateSvgPreview();
              showToast('Vector SVG clipboard pattern detected!', 'success');
              return;
            }

            if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
              switchTab('url-tab');
              urlInput.value = text;
              showToast('File URL clipboard pattern detected!', 'info');
              return;
            }

            // Default Text routing
            switchTab('text-tab');
            textInput.value = text;
            updateLineNumbers();
            autoDetectTextFormat(text);
            showToast('Text clipboard imported into editor', 'info');
            return;
          }
        }
        showToast('No readable content found in clipboard!', 'error');
      } catch (err) {
        console.error(err);
        showToast('Clipboard access denied! Please allow access to paste.', 'error');
      }
    });
  }

  // Load custom empty line counts initially
  updateLineNumbers();
});
