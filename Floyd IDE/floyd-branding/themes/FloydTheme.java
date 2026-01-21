package org.floyd.cursem.theme;

import javax.swing.plaf.ColorUIResource;
import java.awt.Color;

public class FloydTheme extends javax.swing.plaf.metal.MetalTheme {

    @Override
    public String getName() {
        return "Floyd Dark (Legacy AI)";
    }

    // Primary 1: Electric Purple Accent #AB18E4
    protected ColorUIResource getPrimary1() {
        return new ColorUIResource(0xAB18E4);
    }

    // Primary 2: Deep Void Background #0E111A
    protected ColorUIResource getPrimary2() {
        return new ColorUIResource(0x0E111A);
    }

    // Primary 3: Deep Indigo Secondary #1C165E
    protected ColorUIResource getPrimary3() {
        return new ColorUIResource(0x1C165E);
    }

    // Secondary 1: Dark Blue Border #231991
    protected ColorUIResource getSecondary1() {
        return new ColorUIResource(0x231991);
    }

    // Secondary 2: Base Background #0E111A
    protected ColorUIResource getSecondary2() {
        return new ColorUIResource(0x0E111A);
    }

    // Secondary 3: Panel Background #1C165E
    protected ColorUIResource getSecondary3() {
        return new ColorUIResource(0x1C165E);
    }

    @Override
    public ColorUIResource getControlTextColor() {
        return new ColorUIResource(0xffffff); // White text
    }

    // Menu selection background: Bright Blue/Purple #561DFF
    @Override
    public ColorUIResource getMenuSelectedBackground() {
        return new ColorUIResource(0x561DFF);
    }
    
    // Menu selection text: White
    @Override
    public ColorUIResource getMenuSelectedForeground() {
        return new ColorUIResource(0xffffff);
    }
}
