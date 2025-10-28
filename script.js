document.addEventListener('DOMContentLoaded', () => {
    const formSteps = document.querySelectorAll('.form-step');
    const nextButtons = document.querySelectorAll('.next-step-btn');
    const optionButtons = document.querySelectorAll('.option-btn');
    const submitButton = document.getElementById('submit-form');
    const prevButtons = document.querySelectorAll('.prev-step-btn'); // NUEVO: Botones Regresar
    
    const progressBarFill = document.getElementById('progress-fill');
    
    // Controles del Paso 2 (Género/Tipo)
    const step2GenderTitle = document.getElementById('step2-gender-title');
    const step2GenderContent = document.getElementById('step2-gender-content');
    const step2NextBtn = document.getElementById('step2-next-btn');

    // Controles del Paso 4 (Detalle Específico)
    const step4DetailTitle = document.getElementById('step4-detail-title');
    const step4DetailContent = document.getElementById('step4-detail-content');
    const step4NextBtn = document.getElementById('step4-next-btn');

    let currentStep = 1;
    let userSelections = {
        procedimiento: null,
        genero_tipo: null, 
        asistencia: null, 
        especifico: null,
        timing: null,
        nombre: '',
        correo: '',
        celular: '',
        horario_sugerido: ''
    };

    // --- DEFINICIÓN DE FLUJOS CONDICIONALES (El mismo código de lógica) ---

    const flows = {
        // PASO 2: Género/Tipo
        gender_type: {
            endolift: { title: "Seleccionaste Endolift, ¿podrías indicarme lo siguiente?", options: [
                { text: "Hombre", value: "hombre" }, { text: "Mujer", value: "mujer" }, { text: "Consulta", value: "consulta" }
            ]},
            pellets: { title: "Pellets, ¿podrías indicarme lo siguiente?", options: [
                { text: "Hombre", value: "hombre" }, { text: "Mujer", value: "mujer" }
            ]},
            capilar: { title: "Implante Capilar ¿podrías indicarme lo siguiente?", options: [
                { text: "Primera Consulta", value: "primera_consulta" }, { text: "Ya me realicé implante anteriormente", value: "implante_previo" },
                { text: "Ya realicé otras terapias (Plasma, Exosoma, mesosoma, tratamientos)", value: "terapias_previas" }, { text: "Consulta", value: "consulta" }
            ]},
            exosomas: { title: "Exosomas, ¿podrías indicarme lo siguiente?", options: [
                { text: "Hombre", value: "hombre" }, { text: "Mujer", value: "mujer" }
            ]},
            bioestimulacion: { title: "Seleccionaste Bioestimulación, ¿podrías indicarme lo siguiente?", options: [
                { text: "Hombre", value: "hombre" }, { text: "Mujer", value: "mujer" }
            ]}
        },
        // PASO 4: Detalle Específico
        specific_detail: {
            endolift: { 
                hombre: { title: "Seleccionaste Endolift (Hombre), ¿podrías indicarme lo siguiente?", options: [
                    { text: "Facial", value: "facial" }, { text: "Corporal", value: "corporal" }, { text: "Consulta", value: "consulta" }
                ]},
                mujer: { title: "Seleccionaste Endolift (Mujer), ¿podrías indicarme lo siguiente?", options: [
                    { text: "Facial", value: "facial" }, { text: "Corporal", value: "corporal" }, { text: "Consulta", value: "consulta" }
                ]}
            },
            pellets: { 
                hombre: { title: "Pellets (Hombre), ¿podrías indicarme el efecto que buscas?", options: [
                    { text: "Mejorar la potencia sexual", value: "potencia_sexual" }, { text: "Mejorar deportivamente", value: "deportivamente" }, 
                    { text: "Mejorar funcionalmente (músculo, esqueleto)", value: "funcional" }, { text: "Consulta", value: "consulta" }
                ]},
                mujer: { title: "Pellets (Mujer), ¿podrías indicarme el efecto que buscas?", options: [
                    { text: "Mejorar la potencia sexual", value: "potencia_sexual" }, { text: "Mejorar deportivamente", value: "deportivamente" }, 
                    { text: "Mejorar funcionalmente (músculo, esqueleto)", value: "funcional" }, { text: "Consulta", value: "consulta" }
                ]}
            },
            exosomas: {
                hombre: { title: "Exosoma (Hombre), ¿podrías indicarme lo siguiente?", options: [
                    { text: "Capilar", value: "capilar" }, { text: "Piel", value: "piel" }, { text: "Consulta", value: "consulta" }
                ]},
                mujer: { title: "Exosoma (Mujer), ¿podrías indicarme lo siguiente?", options: [
                    { text: "Capilar", value: "capilar" }, { text: "Piel", value: "piel" }, { text: "Rejuvenecimiento Vaginal", value: "vaginal" }, { text: "Consulta", value: "consulta" }
                ]}
            },
            bioestimulacion: {
                general: { title: "Bioestimulación, ¿quieres mejorar?", options: [
                    { text: "1/3 Superior", value: "1_superior" }, { text: "1/3 Medio", value: "1_medio" }, { text: "1/3 Inferior", value: "1_inferior" }, 
                    { text: "1/3 Cuello", value: "1_cuello" }, { text: "1/3 Escote", value: "1_escote" }, { text: "Consulta", value: "consulta" }
                ]}
            },
            capilar: {
                 primera_consulta: { title: "Primera Consulta Capilar: ¿Qué zona es la principal preocupación?", options: [
                    { text: "Coronilla", value: "coronilla" }, { text: "Entradas", value: "entradas" }, { text: "General", value: "general" }
                ]},
                 implante_previo: { title: "Implante Previo: ¿Cuál es el motivo de la nueva consulta?", options: [
                    { text: "Refuerzo", value: "refuerzo" }, { text: "Línea frontal", value: "linea_frontal" }
                ]},
                 terapias_previas: { title: "Ya realicé otras terapias: ¿Cuál es el motivo de la consulta?", options: [
                    { text: "Plasma/Exosoma", value: "plasma_exo" }, { text: "Mesoterapia", value: "meso" }
                ]},
                 consulta: { title: "Consulta general capilar", options: [
                    { text: "Avanzar", value: "avanzar" }
                ]}
            }
        }
    };
    
    // --- LÓGICA DE PROGRESO Y PASOS ---

    function updateProgress() {
        const totalSteps = 6; 
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
            if (stepNumber === 4) { loadStep4(); }
        }
    }
    
    // Lógica para botones "Regresar" (NUEVO BLOQUE)
    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            const prevStep = button.getAttribute('data-prev');
            if (prevStep) {
                const prevStepNum = parseInt(prevStep);
                showStep(prevStepNum);

                // IMPORTANTE: Si regresamos a un paso condicional (P2 o P4),
                // debemos re-habilitar los botones de opción y el botón CONTINUAR.
                if (prevStepNum === 2) {
                    step2NextBtn.disabled = false;
                    document.querySelectorAll('#step2-gender-content button').forEach(btn => btn.disabled = false);
                }
                if (prevStepNum === 4) {
                    step4NextBtn.disabled = false;
                    document.querySelectorAll('#step4-detail-content button').forEach(btn => btn.disabled = false);
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
            if (stepId === 5) { // Paso 5: Timing
                const selectedTiming = document.querySelector('input[name="timing"]:checked');
                if (!selectedTiming) { alert("Por favor, indica cuándo te gustaría realizar el procedimiento."); return; }
                userSelections.timing = selectedTiming.value;
            }
            
            if (button.dataset.next) {
                showStep(parseInt(button.dataset.next));
            }
        });
    });

    // Maneja botones de opción (P2, P3, P4)
    optionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const currentStepId = parseInt(button.closest('.form-step').dataset.step);
            
            if (currentStepId === 3) { // Paso 3: Asistencia
                userSelections.asistencia = button.dataset.assist === 'true';
                showStep(userSelections.asistencia ? 4 : 7); 
            } 
            else if (currentStepId === 2) { // Paso 2: Género/Tipo
                userSelections.genero_tipo = e.currentTarget.dataset.value;
                step2NextBtn.disabled = false;
                document.querySelectorAll('#step2-gender-content button').forEach(btn => btn.disabled = (btn !== e.currentTarget));
            } 
            else if (currentStepId === 4) { // Paso 4: Detalle Específico
                userSelections.especifico = e.currentTarget.dataset.value;
                step4NextBtn.disabled = false;
                document.querySelectorAll('#step4-detail-content button').forEach(btn => btn.disabled = (btn !== e.currentTarget));
            }
        });
    });
    
    // --- Lógica Paso 2 (Género/Tipo) ---
    function loadStep2() {
        step2GenderContent.innerHTML = '';
        step2NextBtn.disabled = true;
        const flow = flows.gender_type[userSelections.procedimiento];
        step2GenderTitle.textContent = flow.title;
        
        flow.options.forEach(opt => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = opt.text;
            button.dataset.value = opt.value;
            button.addEventListener('click', optionButtons[0].onclick);
            step2GenderContent.appendChild(button);
        });
    }

    // --- Lógica Paso 4 (Detalle Específico) ---
    function loadStep4() {
        step4DetailContent.innerHTML = '';
        step4NextBtn.disabled = true;

        const flowKey1 = userSelections.procedimiento;
        const flowKey2 = userSelections.genero_tipo;

        let flow;
        
        if (flowKey1 === 'capilar' && flows.specific_detail.capilar[flowKey2]) {
            flow = flows.specific_detail.capilar[flowKey2];
        } else if (flowKey1 === 'bioestimulacion') {
            flow = flows.specific_detail.bioestimulacion.general;
        } 
        else if (flows.specific_detail[flowKey1] && flows.specific_detail[flowKey1][flowKey2]) {
            flow = flows.specific_detail[flowKey1][flowKey2];
        } else {
            step4DetailTitle.textContent = "Confirmación";
            step4DetailContent.innerHTML = `<p>Continuar para el siguiente paso.</p>`;
            step4NextBtn.disabled = false;
            return;
        }
        
        step4DetailTitle.textContent = flow.title;
        
        flow.options.forEach(opt => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = opt.text;
            button.dataset.value = opt.value;
            button.addEventListener('click', optionButtons[0].onclick);
            step4DetailContent.appendChild(button);
        });
    }


    // --- Lógica Paso 6 (Datos de Contacto y Envío) ---

    const contactInputs = ['name', 'correo', 'celular'];
    
    function checkSubmitValidity() {
        const allFilled = contactInputs.every(id => {
            const input = document.getElementById(id);
            return input.value.trim() !== '';
        });
        submitButton.disabled = !allFilled;
    }

    contactInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', checkSubmitValidity);
    });
    
    submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        userSelections.nombre = document.getElementById('name').value;
        userSelections.correo = document.getElementById('correo').value;
        userSelections.celular = document.getElementById('celular').value;
        userSelections.horario_sugerido = document.getElementById('horario-sugerido').value;

        // *** LÓGICA DE ENVÍO ***
        console.log("--- DATOS CAPTURADOS ---"); 
        console.log(userSelections); 
        
        showStep(8); // Ir a pantalla de éxito
    });

    // --- INICIO ---
    showStep(1);
});