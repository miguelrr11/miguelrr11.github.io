# MIGUI 

## Overview
The MIGUI library provides a simple and customizable user interface for p5js projects, allowing you to create interactive panels, sliders, checkboxes, and more. The panel can be easily configured and used to manage various UI elements in a consistent manner.

## Panel
The `Panel` class allows you to create and manage an UI panel.

### Properties
The `properties` object can be used to customize the panel's behavior and appearance in its creation. Below are the available properties:

| Property          | Type                        | Default Value       | Description |
|-------------------|-----------------------------|---------------------|-------------|
| `x`               | `number`                    | `width - 200`       | X position of the panel. |
| `y`               | `number`                    | `0`                 | Y position of the panel. |
| `w`               | `number`                    | `200`               | Width of the panel. |
| `h`               | `number`                    | `height`            | Height of the panel. |
| `title`           | `string`                    | `""`                | Title of the panel. |
| `darkCol`         | `string/array`              | `[0, 0, 0]`         | Dark color of the panel. Accepts a hex string or RGB array. |
| `lightCol`        | `string/array`              | `[255, 255, 255]`   | Light color of the panel. Accepts a hex string or RGB array. |
| `retractable`     | `boolean`                   | `false`             | Whether the panel can be collapsed. |
| `theme`           | `string`                    | `undefined`         | Predefined theme for the panel (overrides darkCol and lightCol). See available themes below. |
| `automaticHeight` | `boolean`                   | `true`              | Adjusts panel height automatically based on content. |
| `font`            | `p5 font Object / string`   | `'Trebuchet MS'`    | Font used across the panel. |

### Methods

- **`update()`**: Updates all elements within the panel.
- **`show()`**: Displays the panel.
- **`changeColors(darkCol, lightCol)`**: Changes colors for the panel and its elements. Accepts a hex string or an array of 3 RGB values.
- **`setTheme(theme)`**: Changes the color scheme of the panel based on a preexisting theme.
- **`areInputsActive()`**: Returns `true` if one or more inputText are being interacted with.
- **`removeElement(element)`**: Removes `element` from the Panel

### Themes
The following themes are available:
- `mono`, `light`, `dark`, `red`, `blue`, `green`, `yellow`, `spiderman`, `slime`, `clean`, `techno`, `sublime`, `sunset`, `blossom`, `random`

## Elements
The Panel UI library supports various elements that can be added to the panel.

### Checkbox
A checkbox is a UI element that represents a binary state (on or off).

- **`panel.createCheckbox([title], [state])`**: Creates a checkbox.
  - `title` (`string`, optional): Label for the checkbox.
  - `state` (`boolean`, optional): Initial state (`false` by default).
  - **Returns**: `Checkbox` instance.

- **`cb.isChecked()`**: Returns the current state (`true` or `false`).

### Slider
A slider holds a value within a specified range.

- **`panel.createSlider(min, max, origin, [title], [showValue])`**: Creates a slider.
  - `min`, `max` (`number`): Range of the slider.
  - `origin` (`number`): Initial value.
  - `title` (`string`, optional): Label for the slider.
  - `showValue` (`boolean`, optional): Displays the slider value (`false` by default).
  - **Returns**: `Slider` instance.

- **`sl.getValue()`**: Returns the current value.

### Text
Creates a block of formatted text.

- **`panel.createText([text], [isTitle])`**: Creates a text element.
  - `text` (`string`, optional): Content of the text.
  - `isTitle` (`boolean`, optional): If `true`, the text will be styled as a title.
  - **Returns**: `Text` instance.

- **`tx.setText([text])`**: Updates the text content.

### Select
A selector with a list of options.

- **`panel.createSelect([options], [selected])`**: Creates menu with options.
  - `options` (`array` of `string`, optional): Options available in the selector.
  - `selected` (`string`, optional): The initially selected option.
  - **Returns**: `Select` instance.

- **`ss.getSelected()`**: Returns the currently selected option.

### Input (Text)
An input field for text entry.

- **`panel.createInput([placeholder])`**: Creates a text input.
  - `placeholder` (`string`, optional): Placeholder text.
  - **Returns**: `Input` instance.

- **`ip.getText()`**: Returns the current text.
- **`ip.setText(text)`**: Fills the input with `text`.


### Button
A button that triggers a function when clicked.

- **`panel.createButton([title])`**: Creates a button.
  - `title` (`string`, optional): Label for the button.
  - **Returns**: `Button` instance.

- **`bt.setText([text])`**: Updates the button text.
- **`bt.setFunc([func])`**: Updates the function executed on click.


### Color Picker
A color picker with sliders for hue, saturation, and transparency.

- **`panel.createColorPicker([title], [default])`**: Creates a color picker.
  - `title` (`string`, optional): Label for the color picker.
  - `default` (`array`, optional): Default color.
  - **Returns**: `ColorPicker` instance.

- **`cp.getColor()`**: Returns an array of 4 integers representing the RGBA color (`[r, g, b, a]`).

### Number Picker
A number picker allows to change a number with 2 buttons (- and +)

- **`panel.createNumberPicker([title], [min], [max], [delta], [default])`**: Creates a number picker.
  - `title` (`string`, optional): Label for the number picker.
  - `min` (`number`, optional): Minimum value for the picker.
  - `max` (`number`, optional): Maximum value for the picker.
  - `delta` (`number`, optional): Value that determines the change, defaults to 1.
  - `default` (`number`, optional): Default value for the picker.
  - **Returns**: `NumberPicker` instance.

- **`np.getValue()`**: Returns the value of the picker

### Option Picker
Similar to the Number Picker, this allows to select text options.

- **`panel.createOptionPicker([title], [options])`**: Creates an option picker.
  - `title` (`string`, optional): Label for the option picker.
  - `options` (`array`, optional): Options (array of strings).
  - **Returns**: `OptionPicker` instance.

- **`op.getSelected()`**: Returns the option selected

### Separator
Creates a visual separator between elements.

- **`panel.createSeparator()`**: Draws a horizontal line to separate elements.

### Notes
- **Checkboxes** and **buttons** will be stacked horizontally if space allows; other elements are added vertically.
- To disable horizontal stacking between two specific elements, call `panel.separate()` between their creation.
- If you want to use a **custom font**, you must load it in the `preload` function first.

### Common functionalities for all elements
- **`el.disable()`**: Disables the element. (Enabled by default)
- **`el.enable()`**: Enables the element.
- **`el.reposition(x, y, [w], [h])`**: Repositions the element in a given x and y and optionally modifies its dimensions
- **`el.setFunc(func, [arg = false])`**: binds a function to the element. If `arg` is set to true, the function will be called with an argument. Here are the details:
| Element           | Function execution          | Argument            |
|-------------------|-----------------------------|---------------------|
| `Button`               | On click                 | -      |
| `Checkbox`             | On click                 | New boolean value of the cb      |
| `Input`                | Pressing `Enter`         | The text of the input            |
| `Slider`               | On click / drag          | The value of the slider   |
| `Select`               | On click                 | The selected option   |
| `Number Picker`        | On value change        | The value of the picker      |
| `Option Picker`        | On value change          | The selected option      |
| `Color Picker`         | On value change           | The color selected as an array      |
| `Sentence`             | Every frame the text of the element will be changed to whatever the function returns         |-      |

## Example Usage
```javascript
let cb, sl, tx, sc, ip, bt;
let font;

function preload(){
    font = loadFont('coolFont.ttf')
}

function setup() {
    let properties = {
        x: 0,
        y: 0,
        retractable: true,
        theme: "blossom",
        font: font
    };
    panel = new Panel(properties);
    
    cb = panel.createCheckbox("RED", false);
    sl = panel.createSlider(0, 255, 100, "R", true);
    tx = panel.createText("COOL TITLE", true);
    sc = panel.createSelect(["OPTION 1", "option 2", "option 3"], "option 2");  
    ip = panel.createInput("Enter value");
    bt = panel.createButton("Press to ???");
    bt.setFunc(buttonPressed, true)
}

function draw() {
    panel.update();
    panel.show();

    let r1 = cb.isChecked();
    let r2 = sl.getValue();
    let op = sc.getSelected();
}

function buttonPressed(arg) {
    console.log(arg)
}
```