import "./ActionButton.css";

export interface ActionButtonProps {
  label: string;
  href: string;
  /** primary: accent fill with a caption; ghost: no fill, round handle; outline: hairline border, square handle */
  variant: "primary" | "ghost" | "outline";
  /** small line under the label, primary only */
  caption?: string;
  /** arrow drawn in the handle */
  arrow: string;
}

/** Link styled as a button: a white handle with an arrow, then the label */
export default function ActionButton({ label, href, variant, caption, arrow }: ActionButtonProps) {
  return (
    <a className={`action-button action-button--${variant}`} href={href}>
      <span className="action-button__handle">
        <img src={arrow} alt="" width={20} height={20} />
      </span>
      <span className="action-button__text">
        <span className="action-button__label">{label}</span>
        {caption && <span className="action-button__caption">{caption}</span>}
      </span>
    </a>
  );
}
