let descriptions = {
    'createButton': '• Click in blank space to create a new node\n• Click on a segment to divide it and create a new node\n• Keep clicking to create segments between nodes\n• Right click to cancel',
    'createButton_disabled': 'Reset the car state to enable this button',
    'deleteButton': '• Click on a node or path to delete it\n• Hold shift to delete an individual segment ',
    'deleteButton_disabled': 'Reset the car state to enable this button',
    'handButton': '• Click and drag to move nodes\n• Click and drag on blank space to pan the view\n• Double click on a node to toggle individual paths of the intersection',
    'selectButton': '• Click and drag to create a selection box',
    'copyButton': '• Copies the area inside the selection box',
    'pasteButton': '• Pastes the copied nodes, centered on the mouse position',
    'CSmodeButton': '• Activate to create curved segments',

    'numberOfLanesButton': 'Sets the number of lanes when creating new segments',
    'snapButton': 'Nodes snap to grid',
    'setStartButton': 'Sets the start point for pathfinding',
    'setEndButton': 'Sets the end point for pathfinding and executes it',
    'clearPathButton': 'Clears the pathfinding result',

    'laneWidthSlider': 'Sets the width of lanes',
    'bezierLengthSlider': '• Sets the length of bezier segments\n• Lower values create more precise curves',
    'intersecRadiusSlider': '• Sets the radius of intersections\n• Higher values create rounder intersections',
    'deltaTimeSlider': 'Sets the time step of the traffic simulation',

    'resetCarStateButton': '• Deletes cars and traffic lights\nAllows you to get back modifying the road network',
    'addCarsButton': '• Adds N cars to the simulation\nCars are added at random positions with random destinations',
    'generateTrafficLightsButton': '• Automatically generates traffic lights at valid intersections\n• Valid intersections are those with more than 2 segments and at least one segment with more than 1 lane',

    'mainGraphButton': '• Shows the main graph\n• Just nodes connected by paths',
    'segmentsButton': 'Shows the trimmed segments and their directions',
    'intersectionsButton': 'Shows the inner paths of intersections',
    'connectionsButton': '• Shows connections\n• Colored red if its at the start of a segment, white if its at its ending',
    'nodesButton': 'Shows nodes',
    'tagsButton': 'Shows ID related information of visible elements',
    'endingsButton': 'Basically the same as connections',
    'lanesButton': 'Shows the outline of the untrimmed segments, and it fills the trimmed segments based on visual directon, which it\'s not significant',
    'junctionAreaButton': 'Shows the outline of the whole intersection',
    'roadButton': '• Shows the main render of the network\n• It is the only rendering mode that is fully optimized',
    'graphButton': 'Shows the area of both R-Trees: nodes and edges',
    'carDebugButton': 'Shows debug information for cars and traffic lights',
    'showTrisButton': 'Shows the triangles used for rendering',
    
    'zoomButton': 'Current zoom value',
    'OSMRadiusSlider': 'Sets the radius for the OSM System',
    'loadOSM': '• Executes the OSM (Open Street Map) System\n• It fetches the road network around your position in a specified radius and implants it here\n• It may fail, so try again if it does',
    'saveButton': 'Saves the current road network in local storage so you can load it later',
    'loadButton': '• Loads the road network saved in local storage\n• It will overwrite the current road network',

    'wikiButton': `PROCROAD V2\n
        This is a system to create road networks with automatic intersection generation and rendering, and a traffic simulation with pathfinding and traffic lights.\n 
        ELEMENTS\n
        • Nodes: Points that define the shape of the network. If two nodes are connected they form a path. If more than 2 paths are connected to a node, it becomes an intersection.\n
        • Paths: Connections between nodes. The are formed by segments.\n
        • Segments: They are the different lanes of a path. They have a direction. They are trimmed to fit the intersection area.\n
        • Intersections: They are formed when more than 2 paths are connected to a node. They connect the paths connected to the node. To do this, they are formed by intersection segments.\n
        • Intersection segments: They are the segments that form the inner paths of intersections. They are generated automatically based on the shape of the intersection and the incoming and outgoing segments.\n
        • Connections: They are the connections between segments and intersection segments.\n
        • Cars: They are the agents of the traffic simulation. They try to avoid collisions.\n
        • Traffic lights: If generated, they live at intersections and control traffic flow.\n\n
        SYSTEM\n
        The system can be divided in three main parts: the road network editor, the rendering system and the traffic simulation.\n
        • Road network editor: It allows you to create and modify the road network. You can create nodes and connect them with paths, and the system will automatically generate the segments and intersections. You can also modify the shape of the segments by moving the nodes, and the system will automatically update the intersections. It is managed by the road class.\n
        • Rendering system: It renders the road network and the traffic simulation. It has different rendering modes that show different information about the network. The main render mode is optimized to render only what is visible on the screen, so it can handle large networks. It uses 2 R-Trees for efficiency.\n
        • Traffic simulation: It simulates traffic flow in the network. Cars are generated at random positions with random destinations, and they try to find the best path to their destination while avoiding collisions with other cars. If traffic lights are generated, they control traffic flow at intersections.\n\n
        CONTROLS\n
        Hover each button to see what it does
        `
}