import StatusCardComponent from "./status/StatusCardComponent";
import AnomalyStatus from "./status/AnomalyStatus";
import ClosedStatus from "./status/ClosedStatus";
import NotFoundStatus from "./status/NotFoundStatus";
import NotOpenStatus from "./status/NotOpenStatus";
import RecordedStatus from "./status/RecordedStatus";

export default function FailedScan({ invalid_status, anomalyState, activeMapLocation }) {
    const { notFound, isNotOpen, isClosed, isRecorded } = invalid_status || {}

    const statusComponent = (() => {
        if (anomalyState) return <AnomalyStatus />;
        if (notFound) return <NotFoundStatus activeMapLocation={activeMapLocation} />;
        if (isNotOpen) return <NotOpenStatus />;
        if (isClosed) return <ClosedStatus />;
        if (isRecorded) return <RecordedStatus />;
        return null;
    })()

    if (!statusComponent) return null;

    return <StatusCardComponent statusContent={statusComponent} />;
}
