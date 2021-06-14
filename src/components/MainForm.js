import React, {useState} from "react";
import Button from "@material-ui/core/Button";
import {MenuItem, TextField} from "@material-ui/core";

function MainForm() {
    const imageFormats = {
        "jpg" : "jpg",
        "png" : "png"
    }
    const [format, setFormat] = useState("")
    const [selectedFile, setSelectedFile] = useState("")
    const [error, setError] = useState("")
    const [covid, setCovid] = useState("")
    const [normal, setNormal] = useState("")
    const [viral, setViral] = useState("")

    function onFileChange(event) {
        setSelectedFile(event.target.files[0])
    }

    function classify() {
        const formData = new FormData();
        formData.append('file', selectedFile);
        fetch('http://localhost:8080/classify', {
            method: 'POST',
            body: formData
        }).then(
            response => response.json()
        ).then(
            success => {
                console.log(success)
                setError("")
                setCovid(success.find(v => v.className === "covid")["probability"])
                setNormal(success.find(v => v.className === "non-covid")["probability"])
                setViral(success.find(v => v.className === "viral")["probability"])
            }
        ).catch(
            error => {
                console.log(error)
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
            <TextField
                required={true}
                id="select-image-format"
                select
                label="Select image format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
            >
                {Object.keys(imageFormats).map((format) => (
                    <MenuItem key={format} value={format}>
                        {imageFormats[format]}
                    </MenuItem>
                ))}
            </TextField>
            {format && selectedFile &&
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
        </div>
    );
}

export default MainForm;