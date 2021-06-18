import React, {useState} from "react";
import Button from "@material-ui/core/Button";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";

const BASE_BACKEND_URL = "http://localhost:8080"

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

    function resetResults() {
        setCovid("")
        setNormal("")
        setViral("")
        setError("")
        setHeatmapImage("")
    }

    function classify() {
        const formData = new FormData();
        formData.append('file', selectedFile);
        fetchCamImage(formData)
        performClassification(formData)
    }

    function fetchCamImage(sourceImage) {
        fetch(BASE_BACKEND_URL + '/cam/', {
            method: 'POST',
            body: sourceImage,
        }).then(
            response => response.blob()
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
                setHeatmapImage("")
            }
        );
    }

    function performClassification(sourceImage) {
        fetch(BASE_BACKEND_URL + '/classify/', {
            method: 'POST',
            body: sourceImage,
        }).then(
            response => response.json()
        ).then(
            data => {
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
            <div style={{marginTop: 50}}>
                <input onInput={resetResults} type="file" name="image" onChange={onFileChange} accept="image/*"/>
            </div>
            {selectedFile &&
            <div style={{marginTop: 10}}>
                <Button variant="contained"
                        color="primary"
                        type="button"
                        text="Form"
                        onClick={() => classify()}>
                    Classify
                </Button>
            </div>
            }
            {covid &&
            <div style={{marginTop: 30}}>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Classification group</TableCell>
                                <TableCell align="right">Result</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow key="covid">
                                <TableCell component="th" scope="row">
                                    COVID-19
                                </TableCell>
                                <TableCell align="right">{covid}</TableCell>
                            </TableRow>
                            <TableRow key="normal">
                                <TableCell component="th" scope="row">
                                    Normal
                                </TableCell>
                                <TableCell align="right">{normal}</TableCell>
                            </TableRow>
                            <TableRow key="viral">
                                <TableCell component="th" scope="row">
                                    Viral Pneumonia
                                </TableCell>
                                <TableCell align="right">{viral}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
            }
            <br/>
            {error}
            {heatmapImage &&
            <div style={{marginTop: 10}}>
                <img src={heatmapImage} alt="Chest X-Ray with GradCAM heatmap"/>
            </div>
            }
        </div>
    );
}

export default MainForm;