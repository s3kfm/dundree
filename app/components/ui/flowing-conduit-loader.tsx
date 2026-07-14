export const FlowingConduitLoader = () => {
  return (
    <div className="w-full py-8 flex flex-col items-center gap-4">
      {/* Styled indicator matching game-screen-test.html */}
      <div className="flex items-center gap-4 text-primary font-headline text-xs font-bold uppercase tracking-[0.2em]">
        <span className="w-12 h-[1px] bg-primary/30"></span>
        Generating Response
        <span className="w-12 h-[1px] bg-primary/30"></span>
      </div>
    </div>
  );
};
