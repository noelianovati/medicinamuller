document.addEventListener('DOMContentLoaded', () => {
    const formSteps = document.querySelectorAll('.form-step');
    const nextButtons = document.querySelectorAll('.next-step-btn');
    const optionButtons = document.querySelectorAll('.option-btn');
    const submitButton = document.getElementById('submit-form');
    
    const progressBarFill = document.getElementById('progress-fill');
    const step4Title = document.getElementById('step4-title');
    const step4Content = document.getElementById('step4-content');
    const step4NextBtn = document.getElementById('step4-next-btn');

    // Estado del formulario
    let currentStep = 1;
    let userSelections = {
        procedimiento: null,
        asistencia: null,
        timing: null,
        especifico: null, // Para las preguntas condicionales (Paso 4)
        nombre: '',
        correo: '',
        celular: '',
        horario_sugerido: ''
    };

    // Definición de los flujos condicionales (Basado en tus capturas)
    const procedureFlows = {
        endolift: {
            title: "Seleccionaste Endolift, ¿podrías indicarme lo siguiente?",
            options: [
                { text: "Facial", value: "facial" },
                { text: "Corporal", value: "corporal" },
                { text: "Consulta", value: "consulta" }
            ]
        },
        pellets: {
            title: "Pellets, ¿podrías indicarme el efecto que buscas?",
            options: [
                { text: "Mejorar la potencia sexual", value: "potencia_sexual" },
                { text: "Mejorar deportivamente", value: "deportivamente" },
                { text: "Mejorar funcionalmente (músculo, esqueleto)", value: "funcional" },
                { text: "Consulta", value: "consulta" }
            ]
        },
        capilar: {
            title: "Implante capilar ¿podrías indicarme lo siguiente?",
            options: [
                { text: "Primera Consulta", value: "primera_consulta" },
                { text: "Ya me realicé implante anteriormente", value: "implante_previo" },
                { text: "Ya realicé otras terapias (Plasma, Exosoma, mesosoma, tratamientos)", value: "terapias_previas" },
                { text: "Consulta", value: "consulta" }
            ]
        },
        bioestimulacion: {
            title: "Seleccionaste Bioestimulación, ¿quieres mejorar?",
            options: [
                { text: "1/3 Superior", value: "1_superior" },
                { text: "1/3 Medio", value: "1_medio" },
                { text: "1/3 Inferior", value: "1_inferior" },
                { text: "1/3 Cuello", value: "1_cuello" },
                { text: "1/3 Escote", value: "1_escote" },
                { text: "Consulta", value: "consulta" }
            ]
        },
        exosomas: {
            title: "Exosoma, ¿podrías indicarme lo siguiente?",
            options: [
                { text: "Capilar", value: "capilar" },
                { text: "Piel", value: "piel" },
                { text: "Rejuvenecimiento Vaginal", value: "vaginal" },
                { text: "Consulta", value: "consulta" }
            ]
        }
    };

    function updateProgress() {
        // Calcular el porcentaje basado en el número total de pasos visibles
        // Eliminamos el paso de cita/pago (6 y 7 son finales)
        const totalSteps = 5; // Pasos 1, 2, 3, 4, 5
        const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressBarFill.style.width = `${progress}%`;
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
            
            // Lógica para cargar contenido dinámico en el paso 4
            if (stepNumber === 4) {
                loadStep4();
            }
        }
    }
    
    // --- Lógica de Navegación ---

    // Maneja botones de un solo click (Paso 1, 2, 3)
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.dataset.next) {
                if (button.closest('.form-step').dataset.step === '1') {
                    const selectedRadio = document.querySelector('input[name="procedimiento"]:checked');
                    if (!selectedRadio) {
                        alert("Por favor, selecciona un procedimiento antes de continuar.");
                        return;
                    }
                    userSelections.procedimiento = selectedRadio.value;
                }
                showStep(parseInt(button.dataset.next));
            }
        });
    });

    // Maneja botones de opción (Paso 2, y para cargar contenido en Paso 4)
    optionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const nextStep = parseInt(button.dataset.next);
            const currentStepId = parseInt(button.closest('.form-step').dataset.step);

            if (currentStepId === 2) { // Paso de Asistencia
                userSelections.asistencia = button.dataset.assist === 'true';
                // Si dice NO, salta al paso 6 (informativo)
                showStep(nextStep); 
            } else if (currentStepId === 3) { // Paso de Timing
                const selectedTiming = document.querySelector('input[name="timing"]:checked');
                userSelections.timing = selectedTiming.value;
                showStep(nextStep);
            } else if (button.closest('.form-step').dataset.step === '4') { // Dentro de Paso 4
                userSelections.especifico = e.currentTarget.dataset.value;
                // Deshabilitar botones después de clickear uno
                document.querySelectorAll('#step4-content button').forEach(btn => btn.disabled = true);
                document.getElementById('step4-next-btn').disabled = false;
            }
        });
    });

    // --- Lógica Paso 4 (Condicional) ---
    function loadStep4() {
        step4Content.innerHTML = '';
        step4NextBtn.disabled = true;
        const flow = procedureFlows[userSelections.procedimiento];
        
        step4Title.textContent = flow.title;
        
        flow.options.forEach(opt => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = opt.text;
            button.dataset.value = opt.value;
            button.addEventListener('click', optionButtons[0].onclick); // Reusa el listener de option-btn
            step4Content.appendChild(button);
        });
    }

    // --- Lógica Paso 5 (Datos de Contacto y Validación) ---

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

        // *** AQUÍ IRÍA LA LÓGICA PARA ENVIAR userSelections A UN SERVIDOR/EMAIL ***
        // Por ahora, simulamos el éxito
        console.log("Datos a enviar:", userSelections); 
        alert("Datos capturados con éxito. En un sistema real, se enviarían ahora.");
        
        showStep(7); // Ir a pantalla de éxito
    });


    // INICIO: Eventos iniciales
    document.querySelector('input[name="procedimiento"]').forEach(radio => {
        radio.addEventListener('change', () => {
            // Reiniciar el siguiente paso si se cambia de procedimiento en el paso 1
            if (currentStep === 1) {
                document.getElementById('step4-next-btn').disabled = true;
            }
        });
    });

    showStep(1);
});