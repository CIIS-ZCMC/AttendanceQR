import StatusCardComponent from "./Status/StatusCardComponent";
import AnomalyStatus from "./Status/AnomalyStatus";
import ClosedStatus from "./Status/ClosedStatus";
import NotFoundStatus from './Status/NotFoundStatus';
import NotOpenStatus from "./Status/NotOpenStatus";
import RecordedStatus from "./Status/RecordedStatus";

export default function FailedScan({ invalid_status, anomalyState }) {
    const { notFound, isNotOpen, isClosed, isRecorded } = invalid_status || {}

    const statusComponent = (() => {
        if (anomalyState) return <AnomalyStatus />;
        if (notFound) return <NotFoundStatus />;
        if (isNotOpen) return <NotOpenStatus />;
        if (isClosed) return <ClosedStatus />;
        if (isRecorded) return <RecordedStatus />;
        return null;
    })()

    if (!statusComponent) return null;

    return <StatusCardComponent statusContent={statusComponent} />;
}
