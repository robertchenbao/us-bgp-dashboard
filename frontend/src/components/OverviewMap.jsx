import { GeoJsonLayer } from "@deck.gl/layers";
import usStatesGeoJson from "./us-states.json";
import DeckGLMap from "./DeckGLMap";
import { fillColors } from "./utils/constants";

export const overviewViewState = {
    longitude: -97,
    latitude: 40,
    zoom: 3.3,
    maxZoom: 10,
};

function getColorFromAnnouncements(announcements) {
    // This is a simple example - you might want to implement a more complex function
    // that maps a range of announcement counts to different colors.
    if (announcements < 10000) {
        return [221, 221, 221, 200];
    } else if (announcements < 50000) {
        return [167, 201, 232, 200];
    } else if (announcements < 100000) {
        return [85, 150, 213, 200];
    } else {
        return [60, 103, 150, 200]; // Green for 0 announcements
    }
}

const OverviewMap = (props) => {
    const data = props.data;
    const navigate = props.navigate;

    if (!data || !data["usAnnouncementHeatMap"]) {
        console.log("Waiting for data...");
        return null; // Return null or a loading indicator while data is being fetched
    }

    const getTooltip = ({ object }) => {
        if (!object) {
            return null;
        }
        const stateName = object.properties.name;
        const stateAbbr = object.properties.abbreviation;
        const announcements = data["usAnnouncementHeatMap"][stateName];

        return `${stateName} (${stateAbbr.toUpperCase()})\n ${
            announcements || 0
        } announcements`;
    };

    const geoJsonLayer = new GeoJsonLayer({
        id: "geojson-layer",
        data: usStatesGeoJson,
        stroked: true,
        filled: true,
        lineWidthMinPixels: 2,
        getFillColor: (feature) => {
            const stateName = feature.properties.name; // Adjust based on your GeoJSON structure
            const announcements = data["usAnnouncementHeatMap"][stateName] || 0; // Fallback to 0 if no data
            // Implement your logic to map `announcements` to a color
            return getColorFromAnnouncements(announcements);
        },
        getLineColor: [0, 0, 0, 255],
        autoHighlight: true,
        highlightColor: fillColors.highlight,
        pickable: true,
        onClick: ({ object, x, y }) => {
            if (object) {
                const stateAbbr = object.properties.abbreviation;
                navigate(`/${stateAbbr}`);
            }
        },
    });

    const layers = [geoJsonLayer];
    return (
        data && (
            <DeckGLMap
                layers={layers}
                viewState={overviewViewState}
                getTooltip={getTooltip}
            />
        )
    );
};
export default OverviewMap;
