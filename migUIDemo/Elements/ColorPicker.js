class ColorPicker{
	constructor(x, y, title, lightCol, darkCol, transCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
		this.pos = createVector(x, y)
		this.name = title
		this.title = getClippedTextMIGUI(title, clipping_length_normalMIGUI)
		this.isChoosing = false 

		this.isChoosingHue = false
		this.isChoosingSaturation = false
		this.isChoosingAlpha = false

		this.beingPressed = false

		this.beingHovered = false

		this.w = 16
		this.h = 16

		this.cpw = 185
		this.cph = 45
		this.poscp = createVector(constrain(this.pos.x - 10, 0, width - this.cpw - 10), constrain(this.pos.y + this.h * 2, 0, height - this.cph - 10))
		
		this.hue = [0, 0, 0, 255]
		this.saturation = this.transCol
		this.alpha = 255
		this.finalCol = this.transCol

		let posY = this.poscp.y + 5
		this.hBand = this.cph * 0.33 * 0.5
		this.huePos = createVector(this.poscp.x + this.cpw / 2, posY + this.hBand * 0.5)
		posY += this.hBand + 5 + 2.5 * 0.5
		this.saturationPos = createVector(this.poscp.x + this.cpw / 2, posY + this.hBand * 0.5)
		posY += this.hBand + 5 + 2.5 * 0.5
		this.alphaPos = createVector(this.poscp.x + this.cpw - 5, posY + this.hBand * 0.5)
	}

	getColor(){
		return this.finalCol
	}

	toggle(){
		this.isChoosing = !this.isChoosing
	}

	evaluate(){
		if(!mouseIsPressed){
			this.isChoosingHue = false
			this.isChoosingSaturation = false
			this.isChoosingAlpha = false
		}
		let inB_cb = inBoundsMIGUI(mouseX, mouseY, this.pos.x, this.pos.y, this.w+bordeMIGUI, this.h+bordeMIGUI)
		if(inB_cb) this.beingHovered = true
		else{ 
			this.beingHovered = false
		}
		let inB_cp = inBoundsMIGUI(mouseX, mouseY, this.poscp.x, this.poscp.y, this.cpw, this.cph)
		
		if(inB_cb && mouseIsPressed && !this.beingPressed){
			this.toggle()
			this.beingPressed = true
			return true
		}
		if(this.isChoosing && mouseIsPressed){
			this.drawGradients()

			//hue
			if(inBoundsMIGUI(mouseX, mouseY, this.poscp.x + 5, this.poscp.y + 5, this.cpw - 10, this.cph * 0.33 - 7.5) || this.isChoosingHue){
				this.isChoosingHue = true
				this.huePos.x = mouseX
				this.huePos.x = constrain(this.huePos.x, this.poscp.x + 5, this.poscp.x + 5 + this.cpw - 10)
				this.hue = get(this.huePos.x, this.huePos.y)
				this.saturation = get(this.saturationPos.x, this.saturationPos.y)
				
			}
			//saturation
			else if(inBoundsMIGUI(mouseX, mouseY, this.poscp.x + 5, this.poscp.y + this.cph * 0.33 + 2.5, this.cpw - 10, this.cph * 0.33 - 7.5) || this.isChoosingSaturation){
				this.isChoosingSaturation = true
				this.saturationPos.x = mouseX
				this.saturationPos.x = constrain(this.saturationPos.x, this.poscp.x + 5, this.poscp.x + 5 + this.cpw - 10)
				this.saturation = get(this.saturationPos.x, this.saturationPos.y)
			}
			//alpha
			else if(inBoundsMIGUI(mouseX, mouseY, this.poscp.x + 5, this.poscp.y + this.cph * 0.66 + 2.5, this.cpw - 10, this.cph * 0.33 - 7.5) || this.isChoosingAlpha){
				this.isChoosingAlpha = true
				this.alphaPos.x = mouseX
				this.alphaPos.x = constrain(this.alphaPos.x, this.poscp.x + 5, this.poscp.x + 5 + this.cpw - 10)
				this.alpha = map(mouseX, this.poscp.x + 5, this.poscp.x + 5 + this.cpw - 10, 0, 255)
			}

			this.finalCol = [...this.saturation.slice(0, 3), this.alpha];
		}
		if(!mouseIsPressed){ 
			this.beingPressed = false
		}
		if(!inB_cp && !inB_cb && this.isChoosing && mouseIsPressed && !this.isChoosingSaturation && !this.isChoosingHue && !this.isChoosingAlpha){
			this.beingPressed = false
			this.beingHovered = false
			this.isChoosing = false
			return false
		}
		return this.isChoosing
	}

	drawGradients(){
		let x = this.poscp.x + 5
		let y = this.poscp.y + 5
		let w = this.cpw - 5 * 2
		let h = this.cph * 0.33 * 0.5

		drawGradientRainbow(x, y, w, h)
		y += h + 5 + 2.5 * 0.5
		drawGradient2col(x, y, w, h, this.hue)
		y += h + 5 + 2.5 * 0.5
		drawGradientAlpha(x, y, w, h, this.saturation)
	}

	show(){
		push()
		fill(this.finalCol)
		stroke(this.lightCol)
		this.isChoosing ? strokeWeight(bordeMIGUI + 1.5) : strokeWeight(bordeMIGUI)
		rect(this.pos.x, this.pos.y, this.w, this.h)

		noStroke()
		fill(this.lightCol)
		textSize(text_SizeMIGUI)
		text(this.title, this.pos.x + this.w + 10, this.pos.y + this.h*0.85)

		//show picker
		if(this.isChoosing){
			fill(this.darkCol)
			stroke(this.lightCol)
			strokeWeight(bordeMIGUI)
			rect(this.poscp.x, this.poscp.y, this.cpw, this.cph)

			this.drawGradients()
			// drawGradientRainbow(this.poscp.x + 5, this.poscp.y + 5, this.cpw - 10, this.cph * 0.33 - 7.5)
			// drawGradient2col(this.poscp.x + 5, this.poscp.y + this.cph * 0.33 + 2.5, this.cpw - 10, this.cph * 0.33 - 7.5, this.hue)
			// drawGradient2col(this.poscp.x + 5, this.poscp.y + this.cph * 0.66 + 2.5, this.cpw - 10, this.cph * 0.33 - 7.5, this.hue)

			fill(this.hue)
			ellipse(this.huePos.x, this.huePos.y, 10)
			fill(this.saturation)
			ellipse(this.saturationPos.x, this.saturationPos.y, 10)
			fill(this.finalCol)
			ellipse(this.alphaPos.x, this.alphaPos.y, 10)

			fill(255)
			noStroke()
			ellipse(this.poscp.x + this.cpw / 2, this.saturationPos.y, 5)
		}
		

		pop()
	}
}
