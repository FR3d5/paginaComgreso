        const items = [
            {
                titulo: "Montaña Majestuosa",
                fecha: "15 de Octubre, 2024",
                descripcion: "Una impresionante vista de la montaña capturada en su máxima grandiosidad. Los picos nevados se elevan hacia el cielo azul, creando un paisaje de ensueño que toma el aliento. Perfecto para los amantes de la naturaleza y la fotografía de aventura.",
                imagen: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
            },
            {
                titulo: "Playa Paradisíaca",
                fecha: "10 de Septiembre, 2024",
                descripcion: "Las aguas cristalinas de esta hermosa playa invitan a relajarse y disfrutar del paraíso. La arena blanca y el agua turquesa crean una combinación perfecta para unas vacaciones memorables.",
                imagen: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop"
            },
            {
                titulo: "Bosque Encantado",
                fecha: "22 de Agosto, 2024",
                descripcion: "Sumergete en la magia del bosque verde y fresco. Los rayos de sol se filtran entre los árboles creando un ambiente místico y tranquilizador.",
                imagen: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop"
            },
            {
                titulo: "Puesta de Sol",
                fecha: "5 de Julio, 2024",
                descripcion: "Un espectáculo natural de colores cautivadores. Los tonos naranjas, rosados y dorados pintan el cielo en una sinfonía visual que deja sin palabras.",
                imagen: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
            },
            {
                titulo: "Flor Silvestre",
                fecha: "18 de Junio, 2024",
                descripcion: "La belleza natural de una delicada flor silvestre capturada en su máximo esplendor. Estos pequeños tesoros de la naturaleza nos recuerdan la importancia de preservar nuestro planeta.",
                imagen: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop"
            },
            {
                titulo: "Lago Tranquilo",
                fecha: "2 de Mayo, 2024",
                descripcion: "Un oasis de serenidad donde el agua refleja el cielo en perfecta armonía. El lago tranquilo es un lugar ideal para meditar y conectar con la naturaleza.",
                imagen: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop"
            }
        ];

        function abrirModal(index) {
            const modal = document.getElementById('modalGaleria');
            const item = items[index];
            
            document.getElementById('modalImagen').src = item.imagen;
            document.getElementById('modalTitulo').textContent = item.titulo;
            document.getElementById('modalFecha').textContent = item.fecha;
            document.getElementById('modalDescripcion').textContent = item.descripcion;
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        function cerrarModal(event) {
            if (event && event.target.id !== 'modalGaleria') return;
            
            document.getElementById('modalGaleria').style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        // Cerrar modal con tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                cerrarModal();
            }
        });