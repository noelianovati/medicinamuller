document.addEventListener('DOMContentLoaded', () => {
    const formSteps = document.querySelectorAll('.form-step');
    const nextButtons = document.querySelectorAll('.next-step-btn');
    const optionButtons = document.querySelectorAll('.option-btn');
    const submitButton = document.getElementById('submit-form');
    
    const progressBarFill = document.getElementById('progress-fill');
    
    // Controles del Paso 3 (Género/Tipo) - ANTES PASO 4
    const step3GenderTitle = document.getElementById('step3-gender-title');
    const step3GenderContent = document.getElementById('step3-gender-content');
    const step3NextBtn = document.getElementById('step3-next-btn');

    // Controles del Paso 4 (Detalle Específico) - ANTES PASO 5
    const step4DetailTitle = document.getElementById('step4-detail-title');
    const step4DetailContent = document.getElementById('step4-detail-content');
    const step4NextBtn = document.getElementById('step4-next-btn');

    // Estado del formulario
    let currentStep = 1;
    let userSelections = {
        procedimiento: null,
        asistencia: null,
        genero_tipo: null, 
        especifico: null,
        timing: null, // Ahora en el paso 5
        nombre: '',
        correo: '',
        celular: '',
        horario_sugerido: ''
    };

    // --- DEFINICIÓN DE FLUJOS CONDICIONALES (Misma lógica, solo cambia el nombre de las variables) ---

    const flows = {
        // PASO 3: Género/Tipo
        gender_type: {
            endolift: { title: "Seleccionaste Endolift, ¿podrías indicarme lo siguiente?", options: [
                { text: "Hombre", value: "hombre" }, { text: "Mujer", value: "mujer" }, { text: "Consulta", value: "consulta" }
            ]},
            pellets: { title: "Pellets, ¿podrías indicarme lo siguiente?", options: [
                { text: "Hombre", value: "hombre" }, { text: "Mujer", value: "mujer" }
            ]},
            capilar: { title: "Implante Capilar ¿podrías indicarme lo siguiente?", options: [
                { text: "Primera Consulta", value: "primera_consulta" }, 
                { text: "Ya me realicé implante anteriormente", value: "implante_previo" },
                { text: "Ya realicé otras terapias (Plasma, Exosoma, mesosoma, tratamientos)", value: "terapias_previas" },
                { text: "Consulta", value: "consulta" }
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
                hombre: { title: "Bioestimulación, ¿quieres mejorar?", options: [
                    { text: "1/3 Superior", value: "1_superior" }, { text: "1/3 Medio", value: "1_medio" }, { text: "1/3 Inferior", value: "1_inferior" }, 
                    { text: "1/3 Cuello", value: "1_cuello" }, { text: "1/3 Escote", value: "1_escote" }, { text: "Consulta", value: "consulta" }
                ]},
                mujer: { title: "Bioestimulación, ¿quieres mejorar?", options: [
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

    // --- FUNCIONES DE UTILIDAD ---

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
            
            if (stepNumber === 3) { // Nuevo: Cargar Paso 3 (Género/Tipo)
                loadStep3();
            }
            if (stepNumber === 4) { // Nuevo: Cargar Paso 4 (Detalle Específico)
                loadStep4();
            }
        }
    }

    // --- LÓGICA DE NAVEGACIÓN Y DATOS ---

    // Maneja botones de un solo click (Paso 1, 5)
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const stepId = parseInt(button.closest('.form-step').dataset.step);
            
            if (stepId === 1) { // Paso 1: Procedimiento
                const selectedRadio = document.querySelector('input[name="procedimiento"]:checked');
                if (!selectedRadio) {
                    alert("Por favor, selecciona un procedimiento antes de continuar.");
                    return;
                }
                userSelections.procedimiento = selectedRadio.value;
            }
            
            if (stepId === 5) { // Paso 5: Timing (Nuevo orden)
                const selectedTiming = document.querySelector('input[name="timing"]:checked');
                if (!selectedTiming) {
                    alert("Por favor, indica cuándo te gustaría realizar el procedimiento.");
                    return;
                }
                userSelections.timing = selectedTiming.value;
            }
            
            if (button.dataset.next) {
                showStep(parseInt(button.dataset.next));
            }
        });
    });

    // Maneja botones de opción (Paso 2, 3, 4)
    optionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const currentStepId = parseInt(button.closest('.form-step').dataset.step);
            
            if (currentStepId === 2) { // Paso 2: Asistencia
                userSelections.asistencia = button.dataset.assist === 'true';
                showStep(userSelections.asistencia ? 3 : 7); 
            } 
            // CORRECCIÓN CLAVE: El avance de P3 y P4 lo manejan los botones next-step-btn
            // Aquí solo guardamos la selección y habilitamos el botón de avance.
            else if (currentStepId === 3) { // Paso 3: Género/Tipo
                userSelections.genero_tipo = e.currentTarget.dataset.value;
                step3NextBtn.disabled = false;
                // Deshabilitar el resto de botones para forzar la selección única
                document.querySelectorAll('#step3-gender-content button').forEach(btn => btn.disabled = true);
                e.currentTarget.disabled = false; // El seleccionado debe permanecer habilitado
            } else if (currentStepId === 4) { // Paso 4: Detalle Específico
                userSelections.especifico = e.currentTarget.dataset.value;
                step4NextBtn.disabled = false;
                // Deshabilitar el resto de botones
                document.querySelectorAll('#step4-detail-content button').forEach(btn => btn.disabled = true);
                e.currentTarget.disabled = false;
            }
        });
    });
    
    // --- Lógica Paso 3 (Género/Tipo) ---
    function loadStep3() {
        step3GenderContent.innerHTML = '';
        step3NextBtn.disabled = true; // Deshabilitar por defecto al cargar
        
        const flow = flows.gender_type[userSelections.procedimiento];
        step3GenderTitle.textContent = flow.title;
        
        flow.options.forEach(opt => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = opt.text;
            button.dataset.value = opt.value;
            button.addEventListener('click', optionButtons[0].onclick); // Reusa la lógica de optionButtons
            step3GenderContent.appendChild(button);
        });
    }

    // --- Lógica Paso 4 (Detalle Específico) ---
    function loadStep4() {
        step4DetailContent.innerHTML = '';
        step4NextBtn.disabled = true; // Deshabilitar por defecto al cargar

        const flowKey1 = userSelections.procedimiento;
        const flowKey2 = userSelections.genero_tipo;

        let flow;
        
        if (flowKey1 === 'capilar' && flows.specific_detail.capilar[flowKey2]) {
            flow = flows.specific_detail.capilar[flowKey2];
        } else if (flows.specific_detail[flowKey1] && flows.specific_detail[flowKey1][flowKey2]) {
            flow = flows.specific_detail[flowKey1][flowKey2];
        } else {
            // Manejar caso donde el paso 4 no necesita detalle extra (ej. consulta)
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
            button.addEventListener('click', optionButtons[0].onclick); // Reusa la lógica de optionButtons
            step4DetailContent.appendChild(button);
        });
    }


    // --- Lógica Paso 6 (Datos de Contacto y Envío) ---

    const contactInputs = ['name', 'correo', 'celular'];
    const horarioInput = document.getElementById('horario-sugerido');

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
        userSelections.horario_sugerido = horarioInput.value;

        // *** LÓGICA DE ENVÍO: Aquí se enviaría la variable 'userSelections' a un servidor ***
        console.log("--- DATOS CAPTURADOS ---"); 
        console.log(userSelections); 
        
        showStep(8); // Ir a pantalla de éxito
    });

    // --- INICIO ---
    showStep(1);
});