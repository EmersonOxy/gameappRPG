export default function Placeholder({ title, description = "Em breve..." }) {
  return (
    <div className="placeholder">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
