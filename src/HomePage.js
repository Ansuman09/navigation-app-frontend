import React, { useRef, useState } from "react";

const HomePage = () => {
    const [points, setPoints] = useState([]);
    const [pointsLoading, setPointsLoading] = useState(true);
    
    const [startPointIsSet,setStartPointIsSet]=useState(false);
    const [startPoint, setStartPoint] = useState({ xcor: 0, ycor: 0 });

    const [endPointIsSet,setEndPointIsSet]=useState(false);
    const [endPoint, setEndPoint] = useState({ xcor: 0, ycor: 0 });
    const [file, setFile] = useState();
    const imageHolder = useRef();
    const [mapImageDimensions, setImageDimensions] = useState({ xcor: 0, ycor: 0 });
    const [mapName,setMapName]=useState("");

    const handleSubmitForPath = async (e) => {
        e.preventDefault();
        handleGettingRect();

        const pathData = async () => {
            const dataToSend = [startPoint, endPoint];
            const response = await fetch(`http://localhost:8080/api/navigation/findpath/${mapName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            const responseData = await response.json();
            console.log("API Response Data:", responseData); // Log the response data
            console.log("Got map data",mapImageDimensions);
            setPoints(responseData);
            setPointsLoading(false);
            setStartPointIsSet(false);
        };

        pathData();
    };

    const handleFileUpload = (e) => {
        setFile(URL.createObjectURL(e.target.files[0]));
        setMapName(e.target.files[0].name);
        setPointsLoading(true);
    };

    const handleGettingRect = () => {
        const rect = imageHolder.current.getBoundingClientRect();
        console.log("Image Position:", rect.left, rect.top); // Log image position
        setImageDimensions({ xcor: rect.left, ycor: rect.top });
    };

    const handleGettingCoordinates=(e)=>{
        if (!startPointIsSet){
            setStartPoint({ ...startPoint, xcor: Number(e.clientX),ycor: Number(e.clientY)})
            
        }else{
            setEndPoint({...endPoint,xcor:Number(e.clientX),ycor:Number(e.clientY)})
        }
    };


    return (
        <div style={{ position: "relative" }}>
            {/* <div className="my-header">
                <h3>Upload map</h3>
            </div> */}
            <img className={"mapimage"} src={file} alt="map here" ref={imageHolder} onClick={(e)=>handleGettingCoordinates(e)}/>
            <input type="file" onChange={handleFileUpload} />
            
            <form onSubmit={handleSubmitForPath}>
                <p>Start :: {startPoint.xcor},{startPoint.ycor}</p> 
                {startPointIsSet===false ? <button type="button" onClick={()=>setStartPointIsSet(true)} className="cordinates-change"> Confirm Start </button>: 
                <button type="button" className="cordinates-confirmed" onClick={()=>setStartPointIsSet(false)}> Change start </button>}
                <p>End :: {endPoint.xcor},{endPoint.ycor}</p>
                <button type="submit">Submit</button>
            </form>

            {!pointsLoading && points.map(point => {
                
                //logging point coodinates obtained
                console.log("Point Coordinates:", point.xcor, point.ycor);
                const left = mapImageDimensions.xcor + point.xcor; 
                const top = mapImageDimensions.ycor + point.ycor;  
                console.log("Computed Position:", left, top); // Log computed position
                return (
                    <p 
                        key={point.id} // Ensure to provide a unique key
                        style={{
                            position: "absolute",
                            margin: 0,
                            left: left,
                            top: top
                        }}
                    >
                        *
                    </p>
                );
            })}
        </div>
    );
};

export default HomePage;
