# MIGUI 
(documentación escrita por chatGPT)

## Overview
The MIGUI library provides a simple and customizable user interface for p5js projects, allowing you to create interactive panels, sliders, checkboxes, and more. The panel can be easily configured and used to manage various UI components in a consistent manner.

## Panel
The `Panel` class allows you to create and manage a control panel.

### Properties
The `properties` object can be used to customize the panel's behavior and appearance. Below are the available properties:

| Property          | Type           | Default Value       | Description |
|-------------------|----------------|---------------------|-------------|
| `x`               | `number`       | `WIDTH - 200`       | X position of the panel. |
| `y`               | `number`       | `0`                 | Y position of the panel. |
| `w`               | `number`       | `200`               | Width of the panel. |
| `h`               | `number`       | `HEIGHT`            | Height of the panel. |
| `title`           | `string`       | `""`                | Title of the panel. |
| `darkCol`         | `string/array` | `[0, 0, 0]`         | Dark color of the panel. Accepts a hex string or RGB array. |
| `lightCol`        | `string/array` | `[255, 255, 255]`   | Light color of the panel. Accepts a hex string or RGB array. |
| `retractable`     | `boolean`      | `false`             | Whether the panel can be collapsed. |
| `theme`           | `string`       | `undefined`         | Predefined theme for the panel. See available themes below. |
| `automaticHeight` | `boolean`      | `true`              | Adjusts panel height automatically based on content. |

### Methods

- **`update()`**: Updates all elements within the panel.
- **`show()`**: Displays the panel.
- **`changeColors(darkCol, lightCol)`**: Changes colors for the panel and its elements. Accepts a hex string or an array of 3 RGB values.
- **`setTheme(theme)`**: Changes the color scheme of the panel based on a preexisting theme.

### Themes
The following themes are available:
- `mono`, `light`, `dark`, `red`, `blue`, `green`, `yellow`, `spiderman`, `slime`, `clean`, `techno`, `sublime`, `sunset`, `blossom`, `random`

## Components
The Panel UI library supports various components that can be added to the panel.

### Checkbox
A checkbox is a UI element that represents a binary state (on or off).

- **`panel.createCheckbox([title], [state])`**: Creates a checkbox.
  - `title` (`string`, optional): Label for the checkbox.
  - `state` (`boolean`, optional): Initial state (`false` by default).
  - **Returns**: `Checkbox` instance.

- **`cb.isChecked()`**: Returns the current state (`true` or `false`).

### Slider
A slider holds a value within a specified range.

- **`panel.createSlider(min, max, origin, [title], [showValue], [func])`**: Creates a slider.
  - `min`, `max` (`number`): Range of the slider.
  - `origin` (`number`): Initial value.
  - `title` (`string`, optional): Label for the slider.
  - `showValue` (`boolean`, optional): Displays the slider value (`false` by default).
  - `func` (`function`, optional): Function executed when the slider is interacted with.
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

- **`panel.createSelect([options], [selected], [func])`**: Creates menu with options.
  - `options` (`array` of `string`, optional): Options available in the selector.
  - `selected` (`string`, optional): The initially selected option.
  - `func` (`function`, optional): Function executed on selection change.
  - **Returns**: `Select` instance.

- **`ss.getSelected()`**: Returns the currently selected option.

### Input (Text)
An input field for text entry.

- **`panel.createInput([placeholder], [func], [arg])`**: Creates a text input.
  - `placeholder` (`string`, optional): Placeholder text.
  - `func` (`function`, optional): Function executed when the `Enter` key is pressed.
  - `arg` (`boolean`, optional): If true func will be executed with the input text as the argument, defaults to `true`.
  - **Returns**: `Input` instance.

- **`ip.getText()`**: Returns the current text.
- **`ip.setText(text)`**: Fills the input with `text`.

### Button
A button that triggers a function when clicked.

- **`panel.createButton([title], [func])`**: Creates a button.
  - `title` (`string`, optional): Label for the button.
  - `func` (`function`, optional): Function executed when the button is clicked.
  - **Returns**: `Button` instance.

- **`bt.setText([text])`**: Updates the button text.
- **`bt.setFunc([func])`**: Updates the function executed on click.
- **`bt.disable()`**: Disables the button. (Enabled by default)
- **`bt.enable()`**: Enables the button.

### Color Picker
A color picker with sliders for hue, saturation, and transparency.

- **`panel.createColorPicker([title], [func])`**: Creates a color picker.
  - `title` (`string`, optional): Label for the color picker.
  - `func` (`function`, optional): Function executed when the color picker is interacted with.
  - **Returns**: `ColorPicker` instance.

- **`cp.getColor()`**: Returns an array of 4 integers representing the RGBA color (`[r, g, b, a]`).

### Separator
Creates a visual separator between elements.

- **`panel.createSeparator()`**: Draws a horizontal line to separate components.

### Notes
- **Checkboxes** and **buttons** will be stacked horizontally if space allows; other elements are added vertically.
- To disable horizontal stacking between two specific elements, call `panel.separate()` between their creation.

## Example Usage
```javascript
let cb, sl, tx, sc, ip, bt;

function setup() {
    let properties = {
        x: 0,
        y: 0,
        retractable: true,
        theme: "blossom"
    };
    panel = new Panel(properties);
    
    cb = panel.createCheckbox("RED", false);
    sl = panel.createSlider(0, 255, 100, "R", true);
    tx = panel.createText("COOL TITLE", true);
    sc = panel.createSelect(["OPTION 1", "option 2", "option 3"], "option 2");  
    ip = panel.createInput("Enter value", setval);
    bt = panel.createButton("Press to ???", buttonPressed);
}

function draw() {
    panel.update();
    panel.show();

    let r1 = cb.isChecked();
    let r2 = sl.getValue();
    let op = sc.getSelected();
}

function setval() {
    return;
}

function buttonPressed() {
    return;
}
```



