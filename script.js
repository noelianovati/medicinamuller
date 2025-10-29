document.addEventListener('DOMContentLoaded', () => {
    const formSteps = document.querySelectorAll('.form-step');
    const nextButtons = document.querySelectorAll('.next-step-btn');
    const optionButtons = document.querySelectorAll('.option-btn');
    const submitButton = document.getElementById('submit-form');
    const prevButtons = document.querySelectorAll('.prev-step-btn');
    
    const progressBarFill = document.getElementById('progress-fill');
    
    // Controles del Paso 2 (Detalle Específico, antes era Paso 4)
    const step2DetailTitle = document.getElementById('step2-detail-title');
    const step2DetailContent = document.getElementById('step2-detail-content');
    const step2NextBtn = document.getElementById('step2-next-btn');

    // Campos ocultos para el envío
    const formProcedimiento = document.getElementById('form-procedimiento');
    const formDetalle = document.getElementById('form-detalle');
    const formTiming = document.getElementById('form-timing');

    let currentStep = 1;
    let userSelections = {
        procedimiento: null, detalle: null, asistencia: null, timing: null,
        nombre: '', correo: '', celular: '', horario_sugerido: ''
    };

    // --- FLUJOS CONDICIONALES SIMPLIFICADOS (Sólo dependen del procedimiento) ---

    const flows = {
        // PASO 2: Detalle Específico (Ahora sólo depende de Procedimiento)
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
            if (stepNumber === 5) { updateHiddenFields(); } // NUEVO: Actualizar campos ocultos antes de la vista final
        }
    }
    
    // Lógica para botones "Regresar"
    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            const prevStep = button.getAttribute('data-prev');
            if (prevStep) {
                const prevStepNum = parseInt(prevStep);
                showStep(prevStepNum);

                if (prevStepNum === 2) {
                    step2NextBtn.disabled = false;
                    document.querySelectorAll('#step2-detail-content button').forEach(btn => btn.disabled = false);
                    document.querySelectorAll('#step2-detail-content button').forEach(btn => btn.classList.remove('selected'));
                }
            }
        });
    });


    // --- LÓGICA DE NAVEGACIÓN Y DATOS ---

    // Maneja botones de avance
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

    // Maneja botones de opción (P2, P3)
    optionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const currentStepId = parseInt(button.closest('.form-step').dataset.step);
            
            if (currentStepId === 3) { // Paso 3: Asistencia (Avance automático)
                userSelections.asistencia = button.dataset.assist === 'true';
                showStep(userSelections.asistencia ? 4 : 6); 
            } 
            else if (currentStepId === 2) { // Paso 2: Detalle Específico (ANTES PASO 4)
                userSelections.detalle = e.currentTarget.dataset.value;
                step2NextBtn.disabled = false;
                
                // Aplicar estilo de seleccionado y deshabilitar otros
                document.querySelectorAll('#step2-detail-content button').forEach(btn => {
                    btn.disabled = (btn !== e.currentTarget);
                    btn.classList.remove('selected');
                });
                e.currentTarget.classList.add('selected');
                e.currentTarget.disabled = false;
            }
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
            button.addEventListener('click', optionButtons[0].onclick);
            step2DetailContent.appendChild(button);
        });
    }

    // --- PARTE CLAVE DEL ENVÍO: Actualiza los campos ocultos ---
    function updateHiddenFields() {
        // Asignar los valores del objeto userSelections a los campos ocultos del formulario
        formProcedimiento.value = userSelections.procedimiento;
        formDetalle.value = userSelections.detalle;
        formTiming.value = userSelections.timing;
        
        // Habilitar el botón de submit (la validación de campos requeridos sigue en checkSubmitValidity)
        const contactInputs = ['name', 'correo', 'celular'];
        contactInputs.forEach(id => {
            document.getElementById(id).addEventListener('input', checkSubmitValidity);
        });
        checkSubmitValidity(); // Chequeo inicial
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
    
    // No necesitamos un listener para el botón de submit, ya que el <form> lo maneja FormSubmit

    // --- INICIO ---
    showStep(1);
});