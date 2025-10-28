document.addEventListener('DOMContentLoaded', () => {
    const formSteps = document.querySelectorAll('.form-step');
    const nextButtons = document.querySelectorAll('.next-step-btn');
    const prevButtons = document.querySelectorAll('.prev-step-btn');
    
    // Elementos de validación del Paso 4 y 5
    const dateSelect = document.getElementById('date-select');
    const timeSelect = document.getElementById('time-select');
    const continueStep4 = document.getElementById('continue-step4');
    const citaSummary = document.getElementById('cita-summary');
    
    const whatsappInput = document.getElementById('whatsapp');
    const nameInput = document.getElementById('name');
    const queryInput = document.getElementById('query');
    const paymentPolicy = document.getElementById('payment-policy');
    const payButton = document.getElementById('pay-button');

    function showStep(stepNumber) {
        formSteps.forEach(step => {
            step.classList.remove('active');
        });
        const targetStep = document.querySelector(`[data-step="${stepNumber}"]`);
        if(targetStep) {
            targetStep.classList.add('active');
        }
        window.scrollTo(0, 0); 
    }

    // Lógica para botones "Siguiente"
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const nextStep = button.getAttribute('data-next');
            
            // Validación específica para el paso 1 (Selección de procedimiento)
            if (button.closest('.form-step').dataset.step === '1') {
                const selectedRadio = document.querySelector('input[name="procedimiento"]:checked');
                if (!selectedRadio) {
                    alert("Por favor, selecciona un procedimiento antes de continuar.");
                    return;
                }
            }

            if (nextStep) {
                showStep(nextStep);
            }
        });
    });

    // Lógica para botones "Regresar"
    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            const prevStep = button.getAttribute('data-prev');
            if (prevStep) {
                showStep(prevStep);
            }
        });
    });
    
    // --- Lógica de Validación y Actualización de Resumen (Paso 4) ---
    
    dateSelect.addEventListener('change', () => {
        timeSelect.innerHTML = '';
        continueStep4.disabled = true;

        if (dateSelect.value) {
            // SIMULACIÓN: En un entorno real, esto traería horarios reales del servidor
            const hours = ["09:00", "10:30", "12:00", "15:00", "16:30"];
            
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Selecciona una hora';
            timeSelect.appendChild(defaultOption);

            hours.forEach(hour => {
                const option = document.createElement('option');
                option.value = hour;
                option.textContent = hour;
                timeSelect.appendChild(option);
            });
        }
        updateSummary();
    });

    timeSelect.addEventListener('change', updateSummary);

    function updateSummary() {
        const dateValue = dateSelect.value;
        const timeValue = timeSelect.value;
        
        if (dateValue && timeValue) {
            // Muestra la fecha seleccionada
            const dateObj = new Date(dateValue + 'T00:00:00'); 
            const formattedDate = dateObj.toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
            
            citaSummary.textContent = `${formattedDate} a las ${timeValue} hs.`;
            continueStep4.disabled = false;
        } else {
            citaSummary.textContent = 'Selecciona una fecha y hora';
            continueStep4.disabled = true;
        }
    }
    
    // --- Lógica de Validación (Paso 5) ---
    
    function checkStep5Validity() {
        const isWhatsappValid = whatsappInput.value.length > 5; 
        const isNameValid = nameInput.value.trim() !== '';
        const isPolicyAccepted = paymentPolicy.checked;
        
        // Habilita el botón de pago si todos los campos requeridos están completos
        payButton.disabled = !(isWhatsappValid && isNameValid && isPolicyAccepted);
    }

    whatsappInput.addEventListener('input', checkStep5Validity);
    nameInput.addEventListener('input', checkStep5Validity);
    paymentPolicy.addEventListener('change', checkStep5Validity);
    
    // Iniciar mostrando el primer paso
    showStep(1);
});