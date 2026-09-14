document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('labelsContainer');
    const template = document.getElementById('labelTemplate');
    const saveBtn = document.getElementById('saveBtn');
    const addLabelBtn = document.getElementById('addLabelBtn');
    const toast = document.getElementById('toast');

    let labels = [];

    // Fetch initial data
    fetch('/api/labels')
        .then(res => res.json())
        .then(data => {
            labels = data;
            renderLabels();
        })
        .catch(err => {
            console.error('Failed to load labels', err);
            container.innerHTML = '<div class="loading" style="color:var(--danger)">Failed to load labels. Ensure the server is running.</div>';
        });

    function getTextColorForBackground(hexColor) {
        // Remove # if present
        hexColor = hexColor.replace('#', '');
        if (hexColor.length === 3) {
            hexColor = hexColor.split('').map(c => c + c).join('');
        }
        // Convert to RGB
        const r = parseInt(hexColor.substr(0, 2), 16);
        const g = parseInt(hexColor.substr(2, 2), 16);
        const b = parseInt(hexColor.substr(4, 2), 16);
        
        // Calculate perceived brightness
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        
        // Return black or white depending on background brightness
        // GitHub uses a specific contrast algorithm, this is a decent approximation
        return brightness > 125 ? '#000000' : '#ffffff';
    }

    function createLabelCard(labelData, index) {
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.label-card');
        
        const badge = card.querySelector('.badge');
        const inputName = card.querySelector('.input-name');
        const inputColorPicker = card.querySelector('.input-color-picker');
        const inputColorText = card.querySelector('.input-color-text');
        const inputDesc = card.querySelector('.input-desc');
        const deleteBtn = card.querySelector('.delete-btn');

        // Initial setup
        const colorHex = labelData.color.startsWith('#') ? labelData.color : `#${labelData.color}`;
        
        inputName.value = labelData.name || '';
        inputColorPicker.value = colorHex;
        inputColorText.value = colorHex;
        inputDesc.value = labelData.description || '';

        function updatePreview() {
            const name = inputName.value || 'preview';
            const color = inputColorText.value || '#000000';
            
            badge.textContent = name;
            badge.style.backgroundColor = color;
            badge.style.color = getTextColorForBackground(color);
            badge.style.borderColor = 'rgba(0,0,0,0.1)';
        }

        updatePreview();

        // Event listeners
        inputName.addEventListener('input', () => {
            updatePreview();
        });

        inputColorPicker.addEventListener('input', (e) => {
            inputColorText.value = e.target.value;
            updatePreview();
        });

        inputColorText.addEventListener('input', (e) => {
            let val = e.target.value;
            if (val && !val.startsWith('#')) val = '#' + val;
            if (/^#[0-9A-Fa-f]{6}$/i.test(val)) {
                inputColorPicker.value = val;
            }
            updatePreview();
        });

        deleteBtn.addEventListener('click', () => {
            card.remove();
        });

        // Store reference to inputs on the DOM element for easy extraction on save
        card.dataset.index = index;
        return card;
    }

    function renderLabels() {
        container.innerHTML = '';
        if (labels.length === 0) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">No labels found. Click "Add Label" to create one.</div>';
            return;
        }
        
        labels.forEach((label, idx) => {
            const card = createLabelCard(label, idx);
            container.appendChild(card);
        });
    }

    addLabelBtn.addEventListener('click', () => {
        // Remove empty state message if present
        if(container.querySelector('.loading') || container.innerHTML.includes('No labels found')) {
            container.innerHTML = '';
        }
        
        const newLabel = {
            name: 'new label',
            color: '#1d76db',
            description: ''
        };
        const card = createLabelCard(newLabel, container.children.length);
        // Prepend to top
        container.insertBefore(card, container.firstChild);
        
        // Focus the name input
        card.querySelector('.input-name').focus();
    });

    saveBtn.addEventListener('click', () => {
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        const updatedLabels = [];
        const cards = container.querySelectorAll('.label-card');
        
        cards.forEach(card => {
            const name = card.querySelector('.input-name').value.trim();
            const colorFull = card.querySelector('.input-color-text').value.trim();
            const desc = card.querySelector('.input-desc').value.trim();
            
            if (name) {
                updatedLabels.push({
                    name: name,
                    // Remove # for GitHub format
                    color: colorFull.replace('#', ''),
                    description: desc
                });
            }
        });

        fetch('/api/labels', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedLabels)
        })
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.text();
        })
        .then(() => {
            saveBtn.textContent = 'Save Changes';
            saveBtn.disabled = false;
            
            // Show toast
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        })
        .catch(err => {
            console.error('Save failed', err);
            saveBtn.textContent = 'Save Changes';
            saveBtn.disabled = false;
            alert('Failed to save changes. Check console for details.');
        });
    });
});
