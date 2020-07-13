export default class MouseController {

    constructor(gl) {
        var oThis = this;
        this.drag = false;

        this.dZ = 0.0;
        this.dX = 0.0;
        this.dY = 0.0;

        this.theta = 0.0;
        this.phi = 0.0;

        this.old_x = 0.0;
        this.old_y = 0.0;
        this.old_z = 0.0;

        this.canvas = gl.canvas;
        this.ring = document.getElementById("select_ring").value;
        this.dekor = document.getElementById("dekor").value;
        this.skybox = document.getElementById("skybox").value;
        this.skybox_blur = document.getElementById("skyBoxBlur").checked;

        const el_radio = document.getElementsByName("material");
        for (let index = 0; index < el_radio.length; index++) {
            if (el_radio[index].checked) {
                this.material = el_radio[index].defaultValue;
            }
        }

        this.canvas.addEventListener("mousedown", function (e) { oThis.mouseDown(e); });

        this.canvas.addEventListener("mouseup", function (e) { oThis.mouseUp(e); });

        this.canvas.addEventListener("mouseout", function (e) { oThis.mouseUp(e); });

        this.canvas.addEventListener("mousemove", function (e) { oThis.mouseMove(e); });

        document.addEventListener("keydown", function (e) { oThis.onkeydown(e); });
        document.addEventListener("keyup", function (e) { oThis.onkeyup(e); });

        const el = document.getElementById("select_ring");
        el.addEventListener("change", function (e) { oThis.modifyText(e); });

        const el_dekor = document.getElementById("dekor");
        el_dekor.addEventListener("change", function (e) { oThis.modifyTextDekor(e); });

        const el_skybox = document.getElementById("skybox");
        el_skybox.addEventListener("change", function (e) { oThis.modifyTextskyBox(e); });
        const el_skybox_blur = document.getElementById("skyBoxBlur");
        el_skybox_blur.addEventListener("change", function (e) { oThis.modifyTextskyBox_blur(e); });


        //el_radio = document.getElementsByName("material");
        for (let index = 0; index < el_radio.length; index++) {
            el_radio[index].addEventListener("change", function (e) { oThis.modifyTextskyBox_radio(e); });
        }

    }

    mouseDown = function (e) {

        this.drag = true;
        this.old_x = e.pageX, this.old_y = e.pageY;
        e.preventDefault();
        return false;
    };

    mouseUp = function (e) {

        this.drag = false;

    };

    mouseMove = function (e) {
        if (!this.drag) return false;

        this.dX = (e.pageX - this.old_x) * 2 * Math.PI / this.canvas.width;
        this.dY = (e.pageY - this.old_y) * 2 * Math.PI / this.canvas.height;

        // this.theta += this.dX;
        // this.phi += this.dY;

        this.old_x = e.pageX;
        this.old_y = e.pageY;

        e.preventDefault();
    };

    onkeydown = function (e) {

        if (e.key === "ArrowUp") { this.dZ = 0.03; }
        if (e.key === "ArrowDown") { this.dZ = -0.03; }

    };

    onkeyup = function (e) {

        if (e.key === "ArrowUp") { this.dZ = 0.0; }
        if (e.key === "ArrowDown") { this.dZ = 0.0; }

    }

    modifyText() {
        this.ring = document.getElementById("select_ring").value;
    }

    modifyTextDekor() {
        this.dekor = document.getElementById("dekor").value;
    }
    modifyTextskyBox() {
        this.skybox = document.getElementById("skybox").value;
    }

    modifyTextskyBox_blur() {
        this.skybox_blur = document.getElementById("skyBoxBlur").checked;
    }
    modifyTextskyBox_radio() {
        const el_radio = document.getElementsByName("material");
        for (let index = 0; index < el_radio.length; index++) {
            if (el_radio[index].checked) {
                this.material = el_radio[index].defaultValue;
            }
        }
        // this.material = this.value;
    }

}