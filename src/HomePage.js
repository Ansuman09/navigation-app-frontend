import { faLocationArrow, faLocationCrosshairs, faLocationDot, faLocationPin, faLocationPinLock, faMapLocationDot, faPersonWalking } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useRef, useState } from "react";

const HomePage = () => {
    const [points, setPoints] = useState([]);
    const [pointsLoading, setPointsLoading] = useState(true);
    
    const [startPointIsSet,setStartPointIsSet]=useState(false);
    const [startPoint, setStartPoint] = useState({ xcor: 0, ycor: 0 });

    const react_url=process.env.REACT_APP_API_URL;

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
            const response = await fetch(`${react_url}/api/navigation/findpath/${mapName}`, {
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

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
    
        setFile(URL.createObjectURL(file));
        setMapName(file.name);
        setPointsLoading(true);
    
        const formData = new FormData();
        formData.append('image', file); // Assuming your backend expects 'file' as the field name
    
        try {
            const res = await fetch(`${react_url}/api/navigation/upload`, {
                method: "POST",
                body: formData
                // Don't set 'Content-Type' manually; let the browser set it
            });
    
            if (res.ok) {
                alert("Upload successful");
            } else {
                alert("Upload failed");
                console.error("Upload failed with status:", res.status);
            }
        } catch (err) {
            console.error("Error uploading file:", err);
            alert("Upload failed");
        }
    
        handleGettingRect();
    };
    
    

    const uploadImage=async()=>{
        
    };

    const handleGettingRect = () => {
        
        const rect = imageHolder.current.getBoundingClientRect();
        console.log("Image Position:", rect.left, rect.top); // Log image position
        setImageDimensions({ xcor: rect.left, ycor: rect.top });
    };

    const handleGettingCoordinates=(e)=>{
        
        e.preventDefault()
        if (!startPointIsSet){
            setStartPoint({ ...startPoint, xcor: Number(e.clientX)-mapImageDimensions.xcor,ycor: Number(e.clientY)-mapImageDimensions.ycor})
            
        }else{
            setEndPoint({...endPoint,xcor:Number(e.clientX)-mapImageDimensions.xcor,ycor:Number(e.clientY)-mapImageDimensions.ycor})
        }
    };


    return (
        <div className="home-page-container">
            {/* <div className="my-header">
                <h3>Upload map</h3>
            </div> */}
            <img className={"mapimage"} src={file} alt="map here" ref={imageHolder} onClick={(e)=>handleGettingCoordinates(e)}/>
            <input className="image-upload-btn" type="file" onChange={handleFileUpload} />
            
            <form onSubmit={handleSubmitForPath} className="cordinate-set-form">
                <p>{startPointIsSet===true ? <FontAwesomeIcon icon={faLocationPinLock}/>:<FontAwesomeIcon icon={faLocationDot}/>} Start :: {startPoint.xcor},{startPoint.ycor}</p> 
                {startPointIsSet===false ? <button type="button" onClick={()=>setStartPointIsSet(true)} className="cordinates-change"> Confirm Start </button>: 
                <button type="button" className="cordinates-confirmed" onClick={()=>setStartPointIsSet(false)}> Change start </button>}
                <p><FontAwesomeIcon icon={faMapLocationDot}/> End :: {endPoint.xcor},{endPoint.ycor}</p>
                <button type="submit" className="submit-btn" ><FontAwesomeIcon icon={faPersonWalking}/> Go</button>
            </form>

            <div className="description-container">
            <p>This is a navigation app.</p>

            <p>The directions are mapped using A* search algorithm.</p> 
            
            Please use maps with path drawn as lines for best results. The navigation app is currntly almost 70% accurate. 
            The path may come slightly padded. Also curently there are no means to detect longer curved lines yet. Have Fun!


            </div>
            {startPoint.xcor!==0 && <p 
                        style={{
                            position: "absolute",
                            margin: 0,
                            left: startPoint.xcor+mapImageDimensions.xcor,
                            top: startPoint.ycor+mapImageDimensions.ycor,
                            color: "blue"
                        }}
                    >
                        *
                    </p>}

            {endPoint.xcor!==0 && <p 
                        style={{
                            position: "absolute",
                            margin: 0,
                            left: endPoint.xcor+mapImageDimensions.xcor,
                            top: endPoint.ycor+mapImageDimensions.ycor,
                            color: "green"
                        }}
                    >
                        *
                    </p>}
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
