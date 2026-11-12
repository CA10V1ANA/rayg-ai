import { forwardRef } from "react";
import { motion, useIsPresent } from "motion/react";

// An outgoing panel stays visible for its exit, but immediately stops receiving
// focus/clicks. Forward the DOM ref so popLayout can overlap the two panels.
export default forwardRef(function PresencePanel(
  { as = "div", ...props },
  ref,
) {
  const present = useIsPresent();
  const Element = as === "form" ? motion.form : motion.div;
  return (
    <Element
      {...props}
      id={present ? props.id : undefined}
      ref={ref}
      inert={!present}
      aria-hidden={present ? undefined : true}
    />
  );
});
