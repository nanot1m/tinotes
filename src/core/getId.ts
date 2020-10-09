export function getId() {
  return (Date.now() + Math.random() * 1000).toString(16);
}
