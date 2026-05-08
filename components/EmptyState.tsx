export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <p className="font-sans text-[15px] leading-7 text-[#4A3C30]">
        No entries match these filters
      </p>
      <p className="mt-1 font-sans text-[13px] leading-6 text-[#3A2C20]">
        Try removing a filter
      </p>
    </div>
  );
}
