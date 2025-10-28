document.addEventListener('DOMContentLoaded', () => {
    const formSteps = document.querySelectorAll('.form-step');
    const nextButtons = document.querySelectorAll('.next-step-btn');
    const optionButtons = document.querySelectorAll('.option-btn');
    const submitButton = document.getElementById('submit-form');
    
    const progressBarFill = document.getElementById('progress-fill');
    
    // Controles del Paso 4 (Género/Tipo)
    const step4GenderTitle = document.getElementById('step4-gender-title');
    const step4GenderContent = document.getElementById('step4-gender-content');
    const step4NextBtn = document.getElementById('step4-next-btn');

    // Controles del Paso 5 (Detalle Específico)
    const step5DetailTitle = document.getElementById('step5-detail-title');
    const step5DetailContent = document.getElementById('step5-detail-content');
    const step5NextBtn = document.getElementById('step5-next-btn');

    // Estado del formulario
    let currentStep = 1;
    let userSelections = {
        procedimiento: null,
        asistencia: null,
        timing: null,
        genero_tipo: null, // Nuevo: Paso 4
        especifico: null,  // Paso 5
        nombre: '',
        correo: '',
        celular: '',
        horario_sugerido: ''
    };

    // --- DEFINICIÓN DE FLUJOS CONDICIONALES (La lógica principal) ---

    const flows = {
        // PASO 4: Género/Tipo (después de seleccionar el procedimiento)
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
        // PASO 5: Detalle Específico (depende de P1 Y P4)
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
            bioestimulacion: { // Bioestimulación es más simple en tus capturas
                hombre: { title: "Bioestimulación, ¿quieres mejorar?", options: [
                    { text: "1/3 Superior", value: "1_superior" }, { text: "1/3 Medio", value: "1_medio" }, { text: "1/3 Inferior", value: "1_inferior" }, 
                    { text: "1/3 Cuello", value: "1_cuello" }, { text: "1/3 Escote", value: "1_escote" }, { text: "Consulta", value: "consulta" }
                ]},
                mujer: { title: "Bioestimulación, ¿quieres mejorar?", options: [
                    { text: "1/3 Superior", value: "1_superior" }, { text: "1/3 Medio", value: "1_medio" }, { text: "1/3 Inferior", value: "1_inferior" }, 
                    { text: "1/3 Cuello", value: "1_cuello" }, { text: "1/3 Escote", value: "1_escote" }, { text: "Consulta", value: "consulta" }
                ]}
            },
            capilar: { // Capilar depende del valor del Paso 4
                 // Los valores del paso 4 son: primera_consulta, implante_previo, terapias_previas, consulta
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
        // Total de 6 pasos antes del envío (1, 2, 3, 4, 5, 6)
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
            
            if (stepNumber === 4) {
                loadStep4();
            }
            if (stepNumber === 5) {
                loadStep5();
            }
        }
    }

    // --- LÓGICA DE NAVEGACIÓN Y DATOS ---

    // Maneja botones de un solo click (Paso 1, 2, 3)
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
            
            if (stepId === 3) { // Paso 3: Timing
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

    // Maneja botones de opción (Paso 2, 4, 5)
    optionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const currentStepId = parseInt(button.closest('.form-step').dataset.step);
            
            if (currentStepId === 2) { // Paso 2: Asistencia
                userSelections.asistencia = button.dataset.assist === 'true';
                // Si dice NO (asistencia=false), salta al paso 7 (informativo de salida)
                showStep(userSelections.asistencia ? 3 : 7); 
            } else if (currentStepId === 4) { // Paso 4: Género/Tipo
                userSelections.genero_tipo = e.currentTarget.dataset.value;
                step4NextBtn.disabled = false;
                // Deshabilitar el resto de botones en el paso 4
                document.querySelectorAll('#step4-gender-content button').forEach(btn => btn.disabled = true);
            } else if (currentStepId === 5) { // Paso 5: Detalle Específico
                userSelections.especifico = e.currentTarget.dataset.value;
                step5NextBtn.disabled = false;
                // Deshabilitar el resto de botones en el paso 5
                document.querySelectorAll('#step5-detail-content button').forEach(btn => btn.disabled = true);
            }
        });
    });

    // --- Lógica Paso 4 (Género/Tipo) ---
    function loadStep4() {
        step4GenderContent.innerHTML = '';
        step4NextBtn.disabled = true;
        
        const flow = flows.gender_type[userSelections.procedimiento];
        step4GenderTitle.textContent = flow.title;
        
        flow.options.forEach(opt => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = opt.text;
            button.dataset.value = opt.value;
            button.addEventListener('click', (e) => {
                optionButtons[0].onclick(e); // Ejecuta la lógica de optionButtons para Paso 4
            });
            step4GenderContent.appendChild(button);
        });
    }

    // --- Lógica Paso 5 (Detalle Específico) ---
    function loadStep5() {
        step5DetailContent.innerHTML = '';
        step5NextBtn.disabled = true;

        const flowKey1 = userSelections.procedimiento;
        const flowKey2 = userSelections.genero_tipo;

        let flow;
        
        if (flowKey1 === 'capilar' && flows.specific_detail.capilar[flowKey2]) {
            // Caso especial: Capilar depende directamente del valor del Paso 4
            flow = flows.specific_detail.capilar[flowKey2];
        } else if (flows.specific_detail[flowKey1] && flows.specific_detail[flowKey1][flowKey2]) {
            // Casos generales: Endolift, Pellets, Exosomas, Bio
            flow = flows.specific_detail[flowKey1][flowKey2];
        } else {
            // Si no encuentra una rama específica (ej. si P4 era "consulta"), avanza simple
            step5DetailTitle.textContent = "Confirmación";
            step5DetailContent.innerHTML = `<p>Confirmaste tu interés en ${userSelections.procedimiento} (${userSelections.genero_tipo}).</p>`;
            step5NextBtn.disabled = false;
            return;
        }
        
        step5DetailTitle.textContent = flow.title;
        
        flow.options.forEach(opt => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = opt.text;
            button.dataset.value = opt.value;
            button.addEventListener('click', (e) => {
                optionButtons[0].onclick(e); // Ejecuta la lógica de optionButtons para Paso 5
            });
            step5DetailContent.appendChild(button);
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