export default function SectionTitle({
  children,
  subtitulo,
  nivel = "secao",
  centralizado = false,
  className = "",
}) {
  const Tag = nivel === "pagina" ? "h1" : "h2";
  const classeTitulo =
    nivel === "pagina" || nivel === "destaque"
      ? "text-2xl font-bold text-gray-900"
      : "text-lg font-bold text-gray-800";

  return (
    <div
      className={`flex flex-col gap-1 ${
        centralizado ? "items-center text-center" : ""
      } ${className}`}
    >
      <Tag className={classeTitulo}>{children}</Tag>
      {subtitulo && (
        <p className="text-sm text-gray-500 md:text-base">{subtitulo}</p>
      )}
    </div>
  );
}
