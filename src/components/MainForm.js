import React, {useState} from "react";
import Button from "@material-ui/core/Button";

function MainForm() {
    const [selectedFile, setSelectedFile] = useState("")
    const [error, setError] = useState("")
    const [covid, setCovid] = useState("")
    const [normal, setNormal] = useState("")
    const [viral, setViral] = useState("")
    const [heatmapImage, setHeatmapImage] = useState("")

    function onFileChange(event) {
        setSelectedFile(event.target.files[0])
    }

    function classify() {
        const formData = new FormData();
        formData.append('file', selectedFile);
        fetch('http://localhost:8080/cam/', {
            method: 'POST',
            body: formData,
        }).then(
            async response => {
                return response.blob()
            }
        ).then(
            data => {
                console.log(data)
                var saveByteArray = (function () {
                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.style = "display: none";
                    return function (data, name) {
                        const url = window.URL.createObjectURL(data);
                        a.href = url;
                        a.download = name;
                        setHeatmapImage(url)
                        window.URL.revokeObjectURL(url);
                    };
                }());
                saveByteArray(data, 'example.png');
                setError("")
            }
        ).catch(
            error => {
                console.error(error)
                setError(error.message)
                setCovid("")
                setNormal("")
                setViral("")
            }
        );


        fetch('http://localhost:8080/classify/', {
            method: 'POST',
            body: formData,
        }).then(
            async response => {
                return response.json()
            }
        ).then(
            data => {
                console.log(data)
                setError("")
                setCovid(data.covid)
                setNormal(data.normal)
                setViral(data.viral)
            }
        ).catch(
            error => {
                console.error(error)
                setError(error.message)
                setCovid("")
                setNormal("")
                setViral("")
            }
        );
    }

    return (
        <div className="App">
            <div className="upload-image">
                <input type="file" name="image" onChange={onFileChange} accept="image/*"/>
            </div>
            {selectedFile &&
            <Button variant="contained"
                    color="secondary"
                    type="button"
                    text="Form"
                    onClick={() => classify()}>
                Classify
            </Button>
            }
            {covid &&
            <div>
                COVID-19: {covid}
                <br/>
                NORMAL: {normal}
                <br/>
                VIRAL PNEUMONIA: {viral}
            </div>
            }
            <br/>
            {error}
            <img src={heatmapImage} alt="X-Ray with HeatMap"/>
        </div>
    );
}

export default MainForm;