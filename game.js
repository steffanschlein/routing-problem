let boardConfiguration = {}

let hash = window.location.hash.substring(1);
try {
    boardConfiguration = decodeBoardConfiguration(hash)
} catch (error) {
    boardConfiguration = decodeBoardConfiguration(problem16)
}

const PIN_DISTANCE = 50;
const offset = 70;
const PIN_RADIUS = 7;
const rodLength = (PIN_DISTANCE - 2 * PIN_RADIUS) * 0.8;
const rodWidth = PIN_RADIUS * 0.8

const rodBaseColor = 0xd0d0d0;
const rodHighlightColor = 0xff0000;
const pinBaseColor = 0x4c4c4c;
const pinHighlightColor = 0xff0000;
const backgroundColor = "#ffffff"

let app = new PIXI.Application({ width: 640, height: 640, background: backgroundColor });
document.body.appendChild(app.view);

let rodTemplate = new PIXI.Graphics();
rodTemplate.beginFill(0xffffff);
rodTemplate.drawRoundedRect(0, -rodWidth/2, rodLength, rodWidth, rodWidth/4);

let pinTemplate = new PIXI.Graphics();
pinTemplate.beginFill(0xffffff);
pinTemplate.drawCircle(0, 0, PIN_RADIUS);

let pins = Array.from(Array(11), () => new Array(11))
let rods_horizontal = Array.from(Array(11), () => new Array(10));
let rods_vertical = Array.from(Array(11), () => new Array(10));

for (let x_index = 0; x_index < 11; x_index++) {
    for (let y_index = 0; y_index < 11; y_index++) {
        let x = x_index * PIN_DISTANCE + offset
        let y = y_index * PIN_DISTANCE + offset
        if (x_index < 10) {
            let rod = createRod(x + (PIN_DISTANCE - rodLength) / 2, y, 0)
            rods_horizontal[x_index][y_index] = rod
            app.stage.addChild(rod)
        }
        if (y_index < 10) {
            let rod = createRod(x, y + (PIN_DISTANCE - rodLength) / 2, 90)
            rods_vertical[x_index][y_index] = rod
            app.stage.addChild(rod)
        }
        let pin = createPin(x, y)
        pin.x_index = x_index
        pin.y_index = y_index
        pins[x_index][y_index] = pin
        app.stage.addChild(pin)
    }
}

const basicText = new PIXI.Text();

basicText.x = 50;
basicText.y = 20;

app.stage.addChild(basicText);

function loadBordConfiguration(boardConfiguration) {
    boardConfiguration.pinPositions.forEach(position => {
        pins[position.x][position.y].tint = pinHighlightColor;
    })
}

function onClick() {
    toggleRod(this);
    updateUsedRodInfo()
}

let bulkModeStart = null;

function onClickPin() {
    if (bulkModeStart === null) {
        bulkModeStart = [this.x_index, this.y_index]
    } else {
        if (this.x_index === bulkModeStart[0] && this.y_index !== bulkModeStart[1]) {
            range(bulkModeStart[1], this.y_index).forEach(y_index => {
                const rod = rods_vertical[this.x_index][y_index]
                toggleRod(rod);
            })
        } else if (this.x_index !== bulkModeStart[0] && this.y_index === bulkModeStart[1]) {
            range(bulkModeStart[0], this.x_index).forEach(x_index => {
                const rod = rods_horizontal[x_index][this.y_index]
                toggleRod(rod);
            })
        }
        bulkModeStart = null
        updateUsedRodInfo()
    }
}

function toggleRod(rod) {
    if (!rod.selected && countSelectedRods() < boardConfiguration.allowedRods) {
        rod.selected = true;
        rod.tint = rodHighlightColor;
    }
    else if (rod.selected) {
        rod.selected = false;
        rod.tint = rodBaseColor;
    }
}

function updateUsedRodInfo() {
    basicText.text = 'Benutzte Stäbe: ' + countSelectedRods() + ' / ' + boardConfiguration.allowedRods;
}

function countSelectedRods() {
    return rods_vertical.flat().concat(rods_horizontal.flat()).filter(function(rod) {
        return rod.selected;
    }).length;
}

function range(start, end) {
    let result = []
    const lower = Math.min(start, end)
    const higher = Math.max(start, end)
    for (let i = lower; i < higher; i++) {
        result.push(i)
    }
    return result
}

function createRod(x, y, angle) {
    let sprite = new PIXI.Graphics(rodTemplate.geometry);
    sprite.tint = rodBaseColor;
    sprite.x = x
    sprite.y = y
    sprite.angle = angle
    sprite.eventMode = 'static';
    sprite.cursor = 'pointer';
    sprite.on('pointerdown', onClick);
    sprite.selected = false;
    return sprite
}

function createPin(x, y) {
    let sprite = new PIXI.Graphics(pinTemplate.geometry);
    sprite.tint = pinBaseColor;
    sprite.x = x
    sprite.y = y
    sprite.eventMode = 'static';
    sprite.cursor = 'pointer';
    sprite.on('pointerdown', onClickPin);
    return sprite
}

loadBordConfiguration(boardConfiguration);
updateUsedRodInfo();