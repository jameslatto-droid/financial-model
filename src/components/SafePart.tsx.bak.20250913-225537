import React, { Suspense, lazy } from "react";
import ErrorBoundary from "./ErrorBoundary";

const PartA = lazy(() => import("./PartA"));

type Props = Record<string, any>;

export default function SafePart(props: Props) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading Part A...</div>}>
        <PartA {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}
