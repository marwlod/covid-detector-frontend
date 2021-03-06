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
            blob => {
                setError("")
                setLoadingCam(false)
                return new Promise((resolve, reject) => {
                        const reader = new FileReader()
                        reader.onloadend = () => resolve(reader.result)
                        reader.onerror = reject
                        blob = blob.slice(0, blob.size, "image/png")
                        reader.readAsDataURL(blob)
                    }
                )
        }).then(
            data => setHeatmapImage(data)
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
            Aplikacja do wykrywania COVID-19<br/>na zdj??ciach rtg klatki piersiowej
            <div style={{marginTop: 20}}>
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
            <div style={{color: "red"}}>{error}</div>
            {probablyCovidText &&
            <div style={{marginTop: 50}}>
                Podsumowanie
                <br/>
                <div style={{marginTop: 10, fontSize: 'calc(10px + 1vmin)', color: probablyCovid ? "red" : "green"}}>
                    {probablyCovidText}
                </div>
            </div>}
            {covid &&
            <div style={{marginTop: 10}}>
                Szczeg????y
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Grupa klasyfikacyjna</TableCell>
                                <TableCell align="right">Stopie?? pewno??ci</TableCell>
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
                                    Wirusowe zapalenie p??uc
                                </TableCell>
                                <TableCell align="right">{viral}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
            }
            {loadingCam &&
                <div style={{marginTop: 10}}>Generowanie wizualnego wyja??nienia...</div>
            }
            {heatmapImage &&
            <div style={{marginTop: 10}}>
                Wyja??nienie<br/>(mapa cieplna aktywacji algorytmu)
                <br/>
                <img src={heatmapImage} alt="zdj??cie rtg z naniesion?? map?? ciepln?? algorytmu"/>
            </div>
            }
        </div>
    );
}

export default MainForm;