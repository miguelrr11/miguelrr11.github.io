function damp(current, target, perFrame) {
    return lerp(current, target, 1 - Math.pow(1 - perFrame, dt / FRAME_MS))
}

// un tower es cualquier edificio que esté en una celda en el grid
class Tower {
    static globalID = 0

    constructor(pos, gridPos, game, stats = {}) {
        this.pos     = pos
        this.gridPos = gridPos
        this.game    = game
        this.id      = Tower.globalID++
        this.level   = 1
        this.price   = stats.price ?? 0
        this.dead    = false
        
        // si es null, ningun enemigo le ataca
        this.isTargetedBy = stats.isTargetedBy ?? null
    }

    updateLocal() {}
    renderLocal(hoveredTowerID) {}
    getTooltipText(type)   { return null }
    getTooltipOffset() { return SIZE_CELL }
    canLevelUp()       { return false }
    upgradeProperties() {
        throw new Error(`${this.constructor.name} must implement upgradeProperties()`)
    }

    get getDPS(){return this.projectileOptions.damage * 1000 * COOLDOWN_SCALE / this.fireRate}

    update() {
        this.updateLocal()
    }

    render(hoveredTowerID) {
        this.renderLocal(hoveredTowerID)
        //if (hoveredTowerID === this.id) this.renderTooltip()
    }

    getPriceToLevelUp() {
        return round(this.price * LEVEL_UP_PRICE_MULT)
    }

    levelUp() {
        if (!this.canLevelUp()) return false
        this.level++
        this.price = this.getPriceToLevelUp()
        this.upgradeProperties()
        return true
    }

    heal(amount) {}
    get isDamaged() { return false }

    countOres(oreType) {
        const i = this.gridPos.i * 2
        const j = this.gridPos.j * 2
        const grid = this.game.oreGrid
        const cells = [grid[i][j], grid[i + 1][j], grid[i][j + 1], grid[i + 1][j + 1]]
        return cells.filter(cell => cell.type === oreType && cell.hp > 0).length
    }

    renderTooltip(type) {
        const txt = this.getTooltipText(type)
        if (!txt || txt.length == 0) return

        const x = this.pos.x
        const y = this.pos.y - this.getTooltipOffset()

        push()
        noStroke()
        textSize(TOOLTIP_TEXT_SIZE)
        const bbox  = textFont().textBounds(txt, x, y)
        const halfW = bbox.w / 2
        rectMode(CORNER)
        fill(0)
        rect(bbox.x - TOOLTIP_PADDING - halfW, bbox.y - TOOLTIP_PADDING,
             bbox.w + TOOLTIP_PADDING * 2,     bbox.h + TOOLTIP_PADDING * 2)
        fill(255)
        text(txt, x - halfW, y)
        pop()
    }
}

// simplemente produce energia, no es atacado, no ataca y no consume energia
class Generator extends Tower {
    constructor(pos, gridPos, game) {
        super(pos, gridPos, game, { price: GENERATOR_BASE_PRICE })

        this.oresAvailable = this.countOres(ENERGY_CELL)

        const hasAnyOre = this.oresAvailable > 0 ? 1 : 0
        this.generates  = hasAnyOre + GENERATOR_BASE_POWER * 0.5 * (this.oresAvailable / 4)

        this.supply = this.generates
        this.demand = 0   // set by the game's power distribution in game.js
    }

    getTooltipOffset() { return SIZE_CELL * 1.2 }

    getTooltipText(type) {
        if(type == 'stats') return `Supply: ${round(this.supply, 2)}\nDemand: ${round(this.demand * POWER_OFF_RATIO, 2)}`
        else if(type == 'sell') return `Sell for: ${round(this.price * SELL_PERCENTAGE, 1)+CURRENCY_SYMBOL}`
        else return ''
    }

    renderLocal() {
        const diameter = SIZE_CELL * TOWER_BODY_SCALE
        const r = diameter / 2

        push()
        translate(this.pos.x, this.pos.y)
        rotate(frameCount * 0.03 * this.oresAvailable * 0.5)
        fill(COLOR_GENERATOR)
        stroke(0)
        strokeWeight(2)
        ellipse(0, 0, diameter)
        arc(0, -r / 2, r, r, -PI / 2,  PI / 2)
        arc(0,  r / 2, r, r,  PI / 2, -PI / 2)
        pop()
    }
}

// torre que consume energia y tiene vida
class PoweredTower extends Tower {
    constructor(pos, gridPos, game, stats = {}) {
        super(pos, gridPos, game, stats)

        this.maxHp = stats.maxHp ?? 1
        this.hp    = this.maxHp

        this.maxPower = stats.maxPower ?? 1  // power drawn at full demand
        this.working  = false                // set by the game's power distribution
        this.power    = 0                    // set by the game's power distribution
        this.ratio    = 0                    // supply/demand, used for the activity bar
        this.activity = 0                    // rises with demand, decays on its own

        this.fireRate  = stats.fireRate ?? 1
        this.cooldown  = stats.initialCooldown ?? this.fireRate
        this.shootAnim = 0

        this.hasShot = false
    }

    scan() {}                            // look around before acting
    getActivityTarget() { return 0 }     // 0..1, how busy the tower wants to be
    updateAnimation() {}

    heal(amount) {
        if (this.dead) return
        this.hp = Math.min(this.hp + amount, this.maxHp)
    }

    get isDamaged() { return !this.dead && this.hp < this.maxHp }


    getTooltipText(type) {
        if(type == 'levelUp')  return `${this.getPriceToLevelUp()}${CURRENCY_SYMBOL} to level up`
        else if(type == 'sell') return `Sell for: ${round(this.price * SELL_PERCENTAGE, 1)+CURRENCY_SYMBOL}`
        else if(type == 'stats') return `DPS: ${round(this.getDPS, 1)}`
        else return ''
    }

    // pulso por defecto (Miner, Medic). Shooter lo sobreescribe
    updateAnimation() {
        if (!this.hasShot) {
            this.shootAnim = 0
            return
        }
        this.shootAnim = damp(this.shootAnim, 1, 0.15)
        if (this.shootAnim > 0.99) {
            this.shootAnim = 0
            this.hasShot   = false
        }
    }

    update() {
        this.cooldown -= dt * COOLDOWN_SCALE
        this.scan()
        this.updateActivity()
        this.updateLocal()
        this.updateAnimation()
    }

    render(hoveredTowerID) {
        this.renderActivity()
        super.render(hoveredTowerID)
        this.renderHealth()
    }

    getStrokeColor(){
        return this.working ? 0 : 180
    }

    updateActivity() {
        const target = this.getActivityTarget()
        const speed  = target > this.activity ? ACT_ATTACK : ACT_RELEASE
        this.activity += (target - this.activity) * (1 - Math.exp(-speed * dt))
    }

    currentDemand() {
        const load = Math.min(1, this.activity / FULL_AT)
        return this.maxPower * (IDLE_DRAW + (1 - IDLE_DRAW) * load)
    }

    takeDamage({ damage }) {
        this.hp = Math.max(0, this.hp - damage)
        if (this.hp === 0) this.dead = true
    }

    levelUp() {
        const leveled = super.levelUp()
        if (leveled) this.maxPower *= LEVEL_UP_POWER_MULT
        return leveled
    }

    get cellLeft()   { return this.pos.x - SIZE_CELL / 2 }
    get cellBottom() { return this.pos.y + SIZE_CELL / 2 }

    ratioHue() {
        // if (this.ratio < 1)           return map(this.ratio, 0, 0.99, 120, 90)
        // if (this.ratio < LIMIT_RATIO) return map(this.ratio, 1, LIMIT_RATIO, 60, 0)
        if (this.ratio < 1)           return COLOR_ENERGY_CELL_HSB
        if (this.ratio < LIMIT_RATIO) return map(this.ratio, 1, LIMIT_RATIO, COLOR_ENERGY_CELL_HSB, 330)
        return 0
    }

    renderActivity() {
        push()
        rectMode(CORNER)
        noStroke()

        if (!this.working) {
            const visible = frameCount % BLINK_PERIOD < BLINK_PERIOD / 2
            fill(COLOR_ENERGY_CELL[0], COLOR_ENERGY_CELL[1], COLOR_ENERGY_CELL[2], visible ? 255 : 0)
            rect(this.cellLeft, this.cellBottom, SIZE_CELL, -SIZE_CELL)
        } 
        else {
            const h = map(this.ratio, 0, LIMIT_RATIO, 5, SIZE_CELL)
            colorMode(HSB, 255, 255, 255)
            fill(this.ratioHue(), 255, 255)
            rect(this.cellLeft + 2, this.cellBottom - 2, SIZE_CELL * BAR_WIDTH_SCALE, -h + 4, 3)
        }

        pop()
    }

    renderHealth() {
        const h = map(this.hp, 0, this.maxHp, 5, SIZE_CELL)
        push()
        rectMode(CORNER)
        noStroke()
        colorMode(HSB, 255, 255, 255)
        fill(0, 255, 255)
        rect(this.cellLeft + SIZE_CELL - 5, this.cellBottom - 2, SIZE_CELL * BAR_WIDTH_SCALE, -h + 4, 3)
        pop()
    }
}

// no ataca
class Miner extends PoweredTower {
    constructor(pos, gridPos, game) {
        super(pos, gridPos, game, {
            price:        MINER_BASE_PRICE,
            maxPower:     MINER_BASE_POWER,
            fireRate:     40,
            isTargetedBy: 'Raider',
        })
        this.oresAvailable = this.countOres(ORE_CELL)
        this.mineAmt = 0.5 //amount reduced of ore cell in each mine attack
    }

    getActivityTarget() { return 1 }   // el minero siempre trabaja a full demand

    get getDPS(){return this.mineAmt * this.oresAvailable * 1000 * COOLDOWN_SCALE / this.fireRate }

    getTooltipText(type) {
        if(type == 'levelUp')  return `${this.getPriceToLevelUp()}${CURRENCY_SYMBOL} to level up`
        else if(type == 'sell') return `Sell for: ${round(this.price * SELL_PERCENTAGE, 1)+CURRENCY_SYMBOL}`
        else if(type == 'stats') return `OPS: ${round(this.getDPS, 1)}`
        else return ''
    }


    updateLocal() {
        if (this.cooldown > 0 || !this.working) return
        this.oresAvailable = this.countOres(ORE_CELL)
        if (this.oresAvailable > 0) {
            this.game.mine(this.mineAmt, this.gridPos)
            this.hasShot  = true
        }
        this.cooldown = this.fireRate
    }


    renderLocal() {
        const pulse    = this.hasShot ? this.shootAnim * 5 : 0
        const diameter = SIZE_CELL * TOWER_BODY_SCALE - pulse
        const spinning = this.working ? 1 : 0
        const rotation = (frameCount * 0.1 + this.shootAnim) * spinning * (this.oresAvailable / 4)

        push()
        fill(COLOR_MINER)
        stroke(this.getStrokeColor())
        strokeWeight(2)
        ellipse(this.pos.x, this.pos.y, diameter)
        drawCross(this.pos.x, this.pos.y, diameter - 3, rotation)
        pop()
    }
}

// cura torres dañadas en rango
class Medic extends PoweredTower {
    constructor(pos, gridPos, game) {
        super(pos, gridPos, game, {
            price:        MEDIC_BASE_PRICE,
            maxPower:     MEDIC_BASE_POWER,
            fireRate:     1,
            isTargetedBy: 'Raider',
        })
        this.range      = MEDIC_BASE_RANGE
        this.cureAmount = 0.05
        this.patients   = []
    }

    scan() {
        this.patients = this.game.getTowersInRange(this.pos, this.range)
            .filter(tower => tower !== this && tower.isDamaged)
    }

    // solo consume a full cuando hay alguien a quien curar
    getActivityTarget() {
        return this.patients.length > 0 ? 1 : 0
    }

    updateLocal() {
        if (this.cooldown > 0 || !this.working || this.patients.length === 0) return
        for (const tower of this.patients) tower.heal(this.cureAmount)
        this.hasShot  = true
        this.cooldown = this.fireRate
    }

    renderLocal(hoveredTowerID) {
        const pulse    = this.hasShot ? this.shootAnim * 1.2 : 1

        push()
        fill(COLOR_MEDIC)
        stroke(this.getStrokeColor())
        strokeWeight(2)
        drawTriangle(this.pos, SIZE_CELL*.5*pulse)

        const showRange = hoveredTowerID === NO_TOWER_HOVERED || hoveredTowerID === this.id
        if (showRange) {
            const d = distanceAB({ x: mouseX, y: mouseY }, this.pos)
            const alpha = d < RANGE_FADE_START ? 255 : map(d, RANGE_FADE_START, this.range + 20, 255, 0)
            stroke(180, alpha)
            discLinesEllipse({ x: this.pos.x, y: this.pos.y }, this.range, this.range)
        }
        pop()
    }
}

// powered tower que dispara
class Shooter extends PoweredTower {
    constructor(pos, gridPos, game, stats) {
        super(pos, gridPos, game, stats)

        this.range       = stats.range
        this.targetType  = stats.targetType ?? 'Crawler'
        this.projectileOptions     = stats.projectileOptions
        this.drawOptionsProjectile = stats.drawOptionsProjectile   // undefined means default look

        this.enemiesInRange = []
        this.lookingTo = 0
        this.shootAnim = 1
    }

    renderTower() {
        throw new Error(`${this.constructor.name} must implement renderTower()`)
    }

    // sirve para enemigos en un path o en campo libre
    selectTarget(enemies) {
        return enemies.reduce((best, e) =>
            (e.pathIndex - best.pathIndex || e.t - best.t) > 0 ? e : best)
    }

    // Default upgrade (Canon and PeaShooter use this one)
    upgradeProperties() {
        this.projectileOptions.damage += 2
        this.fireRate *= 0.8
    }

    canLevelUp() { return true }

    scan() {
        this.enemiesInRange = this.game.getEnemiesInRange(this, this.targetType)
    }

    getActivityTarget() {
        return this.enemiesInRange.length > 0 ? 1 : 0
    }

    updateLocal() {
        if (this.cooldown > 0 || !this.working || this.enemiesInRange.length === 0) return
        this.shootAt(this.selectTarget(this.enemiesInRange))
    }

    updateAnimation() {
        this.shootAnim = damp(this.shootAnim, 0, 0.5)
    }

    predictPosition(enemy) {
        return {
            x: enemy.pos.x + (enemy.pos.x - enemy.prevPos.x) * SIZE_CELL,
            y: enemy.pos.y + (enemy.pos.y - enemy.prevPos.y) * SIZE_CELL,
        }
    }

    shootAt(enemy) {
        const aim   = this.predictPosition(enemy)
        const angle = atan2(aim.y - this.pos.y, aim.x - this.pos.x)
        this.lookingTo = angle
        this.addProjectile(angle)
        this.cooldown  = this.fireRate
        this.shootAnim = 1
    }

    addProjectile(angle) {
        const from = {
            x: this.pos.x + Math.cos(angle) * SIZE_CELL * 0.5,
            y: this.pos.y + Math.sin(angle) * SIZE_CELL * 0.5,
        }
        // copiamos las stats para que si mejoramos la torre, los proyectiles no cambian
        this.game.addProjectile(from, angle,
            structuredClone(this.projectileOptions), this.drawOptionsProjectile)
    }

    

    renderLocal(hoveredTowerID) {
        push()
        rectMode(CENTER)
        noFill()
        stroke(this.getStrokeColor())
        strokeWeight(2)
        this.renderTower()

        const showRange = hoveredTowerID === NO_TOWER_HOVERED || hoveredTowerID === this.id
        if (showRange) {
            const d = distanceAB({ x: mouseX, y: mouseY }, this.pos)
            const alpha = d < RANGE_FADE_START ? 255 : map(d, RANGE_FADE_START, this.range + 20, 255, 0)
            stroke(180, alpha)
            discLinesEllipse({ x: this.pos.x, y: this.pos.y }, this.range, this.range)
        }
        pop()
    }
}

// shooters normales (disparan enemigos en path (crawlers))
class Canon extends Shooter {
    constructor(pos, gridPos, game) {
        super(pos, gridPos, game, {
            price:           CANON_BASE_PRICE,
            maxPower:        CANON_BASE_POWER,
            range:           CANON_BASE_RANGE,
            fireRate:        6,
            initialCooldown: 0,
            projectileOptions: {
                damage: 0.5, maxSpeed: 0.3, pierce: 1,
                acc: 0.01, startSpeed: 0.001, knockback: 0,
            },
        })
    }

    renderTower() {
        drawCanon(this.pos.x, this.pos.y, this.level, this.shootAnim, this.lookingTo)
    }
}

class CrossBow extends Shooter {
    constructor(pos, gridPos, game) {
        super(pos, gridPos, game, {
            price:    CROSSBOW_BASE_PRICE,
            maxPower: CROSSBOW_BASE_POWER,
            range:    CROSSBOW_BASE_RANGE,
            fireRate: 10,
            projectileOptions: {
                damage: 0.6, maxSpeed: 0.3, pierce: 5,
                acc: 0.01, startSpeed: 0.001, knockback: 0.25,
            },
        })
    }

    upgradeProperties() {
        this.projectileOptions.damage += 0.3
        this.projectileOptions.pierce++
        this.fireRate *= 0.9
    }

    renderTower() {
        drawCrossBow(this.pos.x, this.pos.y, this.level, this.shootAnim, this.lookingTo)
    }
}

class Bomber extends Shooter {
    constructor(pos, gridPos, game) {
        super(pos, gridPos, game, {
            price:    BOMBER_BASE_PRICE,
            maxPower: BOMBER_BASE_POWER,
            range:    BOMBER_BASE_RANGE,
            fireRate: 25,
            projectileOptions: {
                damage: 0.6, maxSpeed: 0.1, pierce: 1,
                acc: 0.005, startSpeed: 0.0005, knockback: 0.25,
                onDeath: 'bomb',
                onDeathOptions: { damage: 1 },
            },
            drawOptionsProjectile: { rad: 12 },
        })
    }

    upgradeProperties() {
        this.projectileOptions.onDeathOptions.damage *= 2
        this.fireRate = Math.max(MIN_FIRE_RATE, this.fireRate - 3.5)
    }

    renderTower() {
        drawBomber(this.pos.x, this.pos.y, this.level, this.shootAnim, this.lookingTo)
    }
}

// dispara enemigos en campo libre (raiders)
class PeaShooter extends Shooter {
    constructor(pos, gridPos, game) {
        super(pos, gridPos, game, {
            price:           PEA_SHOOTER_BASE_PRICE,
            maxPower:        PEA_SHOOTER_BASE_POWER,
            range:           PEA_SHOOTER_BASE_RANGE,
            fireRate:        2,
            initialCooldown: 0,
            targetType:      'Raider',
            isTargetedBy:    'Raider',
            projectileOptions: {
                damage: 0.1, maxSpeed: 0.3, pierce: 1,
                acc: 0.015, startSpeed: 0.005, knockback: 0,
            },
        })
    }

    selectTarget(enemies) {
        const dist = e => distanceAB(this.pos, e.pos)
        return enemies.reduce((best, e) => dist(e) < dist(best) ? e : best)
    }

    renderTower() {
        drawPeaShooter(this.pos.x, this.pos.y, this.level, this.shootAnim, this.lookingTo)
    }
}