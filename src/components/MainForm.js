import React from "react";
import Button from "@material-ui/core/Button";

function MainForm() {
    return (
        <div className="App">
                <div>
                    <Button variant="contained"
                            color="secondary"
                            type="button"
                            text="Form"
                            onClick={() => console.log("clicked")}>
                        Click me
                    </Button>
                </div>
        </div>
    );
}

export default MainForm;