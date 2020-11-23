export type AsyncComponentProps = {
  children: React.ElementType;
};

export default function AsyncComponent({ children }: AsyncComponentProps) {
  return <div style={{ color: "red" }}>{children}</div>;
}
