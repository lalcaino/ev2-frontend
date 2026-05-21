import { motion } from 'framer-motion';

// Definimos cómo entra y sale la página
const animaciones = {
  inicial: { opacity: 0, y: 20 }, // Empieza invisible y un poco más abajo
  animado: { opacity: 1, y: 0 },  // Aparece y sube a su posición normal
  salida: { opacity: 0, y: -20 }  // Desaparece y sube un poco al cambiar de página
};

function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={animaciones}
      initial="inicial"
      animate="animado"
      exit="salida"
      transition={{ duration: 0.3, ease: "easeOut" }} // Dura 0.3 segundos
    >
      {children}
    </motion.div>
  );
}

export default AnimatedPage;