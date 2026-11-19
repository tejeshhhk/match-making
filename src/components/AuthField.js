export default function AuthField({ label, name, type = "text", value, error }) {
  return (
    <label className="block text-sm font-semibold text-slate-700" htmlFor={name}>
      {label}
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={value}
        className="field mt-2"
        autoComplete={type === "password" ? "current-password" : type === "email" ? "email" : "name"}
        aria-invalid={Boolean(error)}
      />
      {error && <span className="mt-1 block text-sm font-medium text-red-700">{error}</span>}
    </label>
  );
}
