document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const contentDiv = document.getElementById('content');
    const recordCountSpan = document.getElementById('recordCount');
    const searchResultCount = document.getElementById('searchResultCount');
    
    let chronicleData = [];
    
    // Загрузка данных
    fetch('data.json')
        .then(response => {
            if (!response.ok) throw new Error('Ошибка загрузки');
            return response.json();
        })
        .then(data => {
            chronicleData = data;
            recordCountSpan.textContent = `Всего записей: ${data.length}`;
            renderEntries(data);
        })
        .catch(error => {
            contentDiv.innerHTML = `<div class="no-results">❌ Ошибка загрузки летописи: ${error.message}</div>`;
        });
    
    // Функция поиска (регистронезависимый, по всем полям)
    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        
        if (!query) {
            renderEntries(chronicleData);
            searchResultCount.textContent = '';
            return;
        }
        
        const words = query.split(/\s+/).filter(w => w.length > 0);
        
        const filtered = chronicleData.filter(entry => {
            // Объединяем все текстовые поля для поиска
            const searchableText = `${entry.date} ${entry.title} ${entry.text}`.toLowerCase();
            
            // Проверяем, что ВСЕ слова из запроса присутствуют
            return words.every(word => searchableText.includes(word));
        });
        
        renderEntries(filtered);
        
        if (filtered.length > 0) {
            searchResultCount.textContent = `Найдено записей: ${filtered.length}`;
        } else {
            searchResultCount.textContent = 'Ничего не найдено';
        }
    }
    
    // Рендер записей с подсветкой слов
    function renderEntries(entries) {
        if (!entries || entries.length === 0) {
            contentDiv.innerHTML = '<div class="no-results">📭 Записей не найдено</div>';
            return;
        }
        
        const query = searchInput.value.trim().toLowerCase();
        const words = query.split(/\s+/).filter(w => w.length > 0);
        
        const html = entries.map(entry => {
            let text = entry.text;
            let title = entry.title;
            
            // Подсветка найденных слов
            if (words.length > 0) {
                const regex = new RegExp(`(${words.join('|')})`, 'gi');
                text = text.replace(regex, '<mark>$1</mark>');
                title = title.replace(regex, '<mark>$1</mark>');
            }
            
            return `
                <div class="chronicle-entry">
                    <div class="entry-date">${entry.date}</div>
                    <div class="entry-title">${title}</div>
                    <div class="entry-text">${text}</div>
                </div>
            `;
        }).join('');
        
        contentDiv.innerHTML = html;
    }

function getPdfLinks(pdfFiles) {
    if (!pdfFiles || pdfFiles.length === 0) return '';
    
    return pdfFiles.map(filename => {
        // Красивое имя файла без расширения и подчеркиваний
        const displayName = filename
            .replace('.pdf', '')
            .replace(/_/g, ' ')
            .replace(/(\d{4})/, '$1 г.');
        
        return `
            <div class="pdf-link-item">
                <a href="pdfs/${filename}" target="_blank" class="pdf-button">
                    <span class="pdf-icon">📄</span>
                    <span class="pdf-name">${displayName}</span>
                </a>
            </div>
        `;
    }).join('');
}
    
    // Обработчики событий
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    // Живой поиск (опционально)
    let debounceTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(performSearch, 300);
    });
});