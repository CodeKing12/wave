import { motion, AnimatePresence } from 'framer-motion';

const variants = {
    in: {
        y: 100,
        opacity: 0,
        transition: {
            duration: 300,
            ease: 'easeInOut'
        }
    },
    out: {
      opacity: 0,
      y: -100,
      transition: {
        duration: 300,
        ease: 'easeInOut'
      }
    },
    inactive: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 300,
          ease: 'easeInOut'
        },
    },
}

const Transition = ({ children }: { children: any }) => {
  return (
		<div className="effect-1">
			<AnimatePresence
	      initial={false}
	      mode="wait"
	    >
	      <motion.div
            variants={variants}
            initial="in"
            animate="inactive"
            exit="out"
        >
	        {children}
	      </motion.div>
	    </AnimatePresence>
		</div>
	);
};

export default Transition;