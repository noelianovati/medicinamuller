document.addEventListener('DOMContentLoaded', () => {
    const formSteps = document.querySelectorAll('.form-step');
    const nextButtons = document.querySelectorAll('.next-step-btn');
    const submitButton = document.getElementById('submit-form');
    const prevButtons = document.querySelectorAll('.prev-step-btn');
    
    const progressBarFill = document.getElementById('progress-fill');
    
    // Controles del Paso 2 (Detalle Específico)
    const step2DetailTitle = document.getElementById('step2-detail-title');
    const step2DetailContent = document.getElementById('step2-detail-content');
    const step2NextBtn = document.getElementById('step2-next-btn');

    // Campos ocultos para el envío
    const formProcedimiento = document.getElementById('form-procedimiento');
    const formDetalle = document.getElementById('form-detalle');
    const formTiming = document.getElementById('form-timing');
    const formRedirect = document.getElementById('form-redirect');

    let currentStep = 1;
    let userSelections = {
        procedimiento: null, detalle: null, asistencia: null, timing: null,
        nombre: '', correo: '', celular: '', horario_sugerido: ''
    };

    // --- FLUJOS CONDICIONALES ---
    const flows = {
        specific_detail: {
            endolift: { title: "Seleccionaste Endolift, ¿podrías indicarme lo siguiente?", options: [
                { text: "Facial", value: "facial" }, { text: "Corporal", value: "corporal" }, { text: "Consulta", value: "consulta" }
            ]},
            pellets: { title: "Pellets, ¿podrías indicarme el efecto que buscas?", options: [
                { text: "Mejorar la potencia sexual", value: "potencia_sexual" }, { text: "Mejorar deportivamente", value: "deportivamente" }, 
                { text: "Mejorar funcionalmente (músculo, esqueleto)", value: "funcional" }, { text: "Consulta", value: "consulta" }
            ]},
            exosomas: { title: "Exosomas, ¿podrías indicarme lo siguiente?", options: [
                { text: "Capilar", value: "capilar" }, { text: "Piel", value: "piel" }, { text: "Rejuvenecimiento Vaginal", value: "vaginal" }, { text: "Consulta", value: "consulta" }
            ]},
            bioestimulacion: { title: "Bioestimulación, ¿quieres mejorar?", options: [
                { text: "1/3 Superior", value: "1_superior" }, { text: "1/3 Medio", value: "1_medio" }, { text: "1/3 Inferior", value: "1_inferior" }, 
                { text: "1/3 Cuello", value: "1_cuello" }, { text: "1/3 Escote", value: "1_escote" }, { text: "Consulta", value: "consulta" }
            ]},
            capilar: { title: "Implante Capilar ¿podrías indicarme lo siguiente?", options: [
                { text: "Primera Consulta", value: "primera_consulta" }, 
                { text: "Ya me realicé implante anteriormente", value: "implante_previo" },
                { text: "Ya realicé otras terapias (Plasma, Exosoma, mesosoma, tratamientos)", value: "terapias_previas" },
                { text: "Consulta", value: "consulta" }
            ]}
        }
    };
    
    // --- LÓGICA DE PROGRESO Y PASOS ---

    function updateProgress() {
        const totalSteps = 5; 
        const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressBarFill.style.width = `${Math.min(100, progress)}%`;
    }

    function showStep(stepNumber) {
        formSteps.forEach(step => {
            step.classList.remove('active');
        });
        const targetStep = document.querySelector(`[data-step="${stepNumber}"]`);
        if(targetStep) {
            targetStep.classList.add('active');
            currentStep = stepNumber;
            updateProgress();
            
            if (stepNumber === 2) { loadStep2(); }
            if (stepNumber === 5) { updateHiddenFields(); }
        }
    }
    
    // Lógica para botones "Regresar"
    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            const prevStep = button.getAttribute('data-prev');
            if (prevStep) {
                const prevStepNum = parseInt(prevStep);
                showStep(prevStepNum);

                // Resetear estado de botones del Paso 2 al retroceder
                if (prevStepNum === 2) {
                    step2NextBtn.disabled = true; 
                    document.querySelectorAll('#step2-detail-content button').forEach(btn => {
                        btn.disabled = false;
                        btn.classList.remove('selected');
                    });
                }
            }
        });
    });


    // --- LÓGICA DE NAVEGACIÓN Y DATOS ---

    // Maneja botones de avance (Paso 1, 4)
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const stepId = parseInt(button.closest('.form-step').dataset.step);
            
            // Validaciones
            if (stepId === 1) { 
                const selectedRadio = document.querySelector('input[name="procedimiento"]:checked');
                if (!selectedRadio) { alert("Por favor, selecciona un procedimiento."); return; }
                userSelections.procedimiento = selectedRadio.value;
            }
            if (stepId === 4) { // Paso 4: Timing
                const selectedTiming = document.querySelector('input[name="timing"]:checked');
                if (!selectedTiming) { alert("Por favor, indica cuándo te gustaría realizar el procedimiento."); return; }
                userSelections.timing = selectedTiming.value;
            }
            
            if (button.dataset.next) {
                showStep(parseInt(button.dataset.next));
            }
        });
    });

    // Maneja botones de opción (Paso 3: Asistencia)
    document.querySelectorAll('.form-step[data-step="3"] .option-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            userSelections.asistencia = button.dataset.assist === 'true';
            showStep(userSelections.asistencia ? 4 : 6); 
        });
    });
    
    // --- Lógica Paso 2 (Detalle Específico) ---
    function loadStep2() {
        step2DetailContent.innerHTML = '';
        step2NextBtn.disabled = true;
        
        const flow = flows.specific_detail[userSelections.procedimiento];
        step2DetailTitle.textContent = flow.title;
        
        flow.options.forEach(opt => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = opt.text;
            button.dataset.value = opt.value;
            step2DetailContent.appendChild(button);
        });
    }
    
    // DELEGADO DE EVENTOS para Paso 2 (SOLUCIONA EL PROBLEMA DEL CLIC)
    step2DetailContent.addEventListener('click', (e) => {
        const target = e.target.closest('.option-btn');
        if (target && !target.disabled) {
            userSelections.detalle = target.dataset.value;
            step2NextBtn.disabled = false;
            
            // Aplicar estilo de seleccionado (clase 'selected') y deshabilitar/actualizar estado
            document.querySelectorAll('#step2-detail-content button').forEach(btn => {
                btn.disabled = (btn !== target);
                btn.classList.remove('selected'); 
            });
            target.classList.add('selected');
            target.disabled = false;
        }
    });


    // --- PARTE CLAVE DEL ENVÍO: Actualiza los campos ocultos ---
    function updateHiddenFields() {
        // Recolectar valores seleccionados
        const selectedProc = document.querySelector('input[name="procedimiento"]:checked').closest('label').textContent.trim();
        const selectedDet = document.querySelector('#step2-detail-content button.selected')?.textContent.trim() || 'No especificado';
        const selectedTiming = document.querySelector('input[name="timing"]:checked')?.closest('label')?.textContent.trim() || 'No especificado';

        // Asignar valores a campos ocultos
        formProcedimiento.value = selectedProc;
        formDetalle.value = selectedDet;
        formTiming.value = selectedTiming;
        
        // Configurar redirección
        const userDomain = window.location.origin + window.location.pathname;
        formRedirect.value = userDomain + "?step=7";

        // Habilitar botón de submit
        const contactInputs = ['name', 'correo', 'celular'];
        contactInputs.forEach(id => {
            document.getElementById(id).addEventListener('input', checkSubmitValidity);
        });
        checkSubmitValidity(); 
    }

    // --- Lógica Paso 5 (Datos de Contacto y Envío) ---
    function checkSubmitValidity() {
        const contactInputs = ['name', 'correo', 'celular'];
        const allFilled = contactInputs.every(id => {
            const input = document.getElementById(id);
            return input.value.trim() !== '';
        });
        submitButton.disabled = !allFilled;
    }

    // Envío a Web3Forms
    document.getElementById('web3forms-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
        
        const formData = new FormData(e.target);
        
        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                showStep(7); // Éxito
            } else {
                console.error('Error de envío:', response.statusText);
                alert('Hubo un error al enviar el formulario. Por favor, inténtalo de nuevo.');
                submitButton.disabled = false;
                submitButton.textContent = 'ENVIAR SOLICITUD →';
            }
        } catch (error) {
            console.error('Error de red:', error);
            alert('Error de conexión. Por favor, revisa tu conexión a internet.');
            submitButton.disabled = false;
            submitButton.textContent = 'ENVIAR SOLICITUD →';
        }
    });
    
    // --- INICIO ---
    showStep(1);
});