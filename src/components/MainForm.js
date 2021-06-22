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
    const [loadingCam, setLoadingCam] = useState(false)
    const [probablyCovid, setProbablyCovid] = useState(false)
    const [probablyCovidText, setProbablyCovidText] = useState("")

    function onFileChange(event) {
        setSelectedFile(event.target.files[0])
    }

    function resetResults() {
        setCovid("")
        setNormal("")
        setViral("")
        setError("")
        setHeatmapImage("")
        setProbablyCovidText("")
    }

    function classify() {
        resetResults();
        const formData = new FormData();
        formData.append('file', selectedFile);
        performClassification(formData)
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
                const isCovid = parseFloat(data.covid) > parseFloat(data.normal) &&
                                parseFloat(data.covid) > parseFloat(data.viral);
                setProbablyCovid(isCovid)
                if (isCovid) {
                    setProbablyCovidText("Prawdopodobnie COVID-19")
                } else {
                    setProbablyCovidText("Prawdopodobnie nie COVID-19")
                }
                fetchCamImage(sourceImage)
            }
        ).catch(
            error => {
                console.error(error)
                setError(error.message)
                setCovid("")
                setNormal("")
                setViral("")
                setProbablyCovidText("")
            }
        );
    }

    function fetchCamImage(sourceImage) {
        setLoadingCam(true)
        fetch(BASE_BACKEND_URL + '/cam/', {
            method: 'POST',
            body: sourceImage,
        }).then(
            response => response.blob()
        ).then(
            data => {
                const saveByteArray = (function () {
                    const a = document.createElement("a");
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
                saveByteArray(data, 'xray_image.png');
                setError("")
                setLoadingCam(false)
            }
        ).catch(
            error => {
                console.error(error)
                setError(error.message)
                setHeatmapImage("")
                setLoadingCam(false)
            }
        );
    }

    return (
        <div className="App">
            Aplikacja do wykrywania COVID-19<br/>na zdjęciach rtg klatki piersiowej
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
                    Klasyfikuj
                </Button>
            </div>
            }
            {probablyCovidText &&
            <div style={{marginTop: 30}}>
                Podsumowanie
                <br/>
                <div style={{marginTop: 10, fontSize: 'calc(10px + 1vmin)', color: probablyCovid ? "red" : "green"}}>
                    {probablyCovidText}
                </div>
            </div>}
            {covid &&
            <div style={{marginTop: 10}}>
                Szczegóły
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Grupa klasyfikacyjna</TableCell>
                                <TableCell align="right">Stopień pewności</TableCell>
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
                                    Zdrowy
                                </TableCell>
                                <TableCell align="right">{normal}</TableCell>
                            </TableRow>
                            <TableRow key="viral">
                                <TableCell component="th" scope="row">
                                    Wirusowe zapalenie płuc
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
            {loadingCam &&
                <div style={{marginTop: 10}}>Generowanie wizualnego wyjaśnienia...</div>
            }
            {heatmapImage &&
            <div style={{marginTop: 10}}>
                Wyjaśnienie<br/>(mapa cieplna aktywacji algorytmu)
                <br/>
                <img src={heatmapImage} alt="zdjęcie rtg z naniesioną mapą cieplną algorytmu"/>
            </div>
            }
        </div>
    );
}

export default MainForm;