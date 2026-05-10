import React from "react";
import Card from "../components/ui/Card";

const SinglePageHome = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <section aria-label="Dashboard layer">
        <Card className="p-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Dashboard Layer
          </p>
          <p className="text-sm text-slate-500">
            Dashboard UI renders here in the unified canvas.
          </p>
        </Card>
      </section>

      <section aria-label="Planner layer">
        <Card className="p-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Planner Layer
          </p>
          <p className="text-sm text-slate-500">
            Planner UI renders here in the unified canvas.
          </p>
        </Card>
      </section>

      <section aria-label="Session stream layer">
        <Card className="p-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Session Stream Layer
          </p>
          <p className="text-sm text-slate-500">
            Session stream UI renders here in the unified canvas.
          </p>
        </Card>
      </section>

      <section aria-label="Timer overlay layer">
        <Card className="p-6 border-dashed border-slate-200 text-center text-sm text-slate-500">
          Timer overlay placeholder.
        </Card>
      </section>
    </div>
  );
};

export default SinglePageHome;
