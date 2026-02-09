export default function toggleMulti(
    value: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) {
    setList((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  }