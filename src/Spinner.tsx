import "./Spinner.css";

export function Spinner() {
  return (
    <span
      data-testid="spinner"
      className="spinner text-2xl min-w-fit min-h-fit"
    >
      🌀
    </span>
  );
}

export default Spinner;
