// API URL
const API_URL = window.location.origin + '/api';

// Form submission
document.getElementById('leadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: e.target.name.value,
        email: e.target.email.value,
        phone: e.target.phone.value,
        building_name: e.target.buildingName.value,
        message: e.target.message.value || ''
    };
    
    const button = e.target.querySelector('button');
    button.textContent = 'Enviando...';
    button.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/leads`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            document.getElementById('leadForm').style.display = 'none';
            document.getElementById('success').style.display = 'block';
        } else {
            alert('Erro ao enviar formulário. Tente novamente.');
            button.textContent = 'Solicitar Demonstração';
            button.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Erro ao enviar formulário. Tente novamente.');
        button.textContent = 'Solicitar Demonstração';
        button.disabled = false;
    }
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});