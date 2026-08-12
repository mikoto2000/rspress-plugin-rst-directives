# RST list-table fixture

## Figure

.. figure:: ./images/sample.svg
   :alt: Rspress figure pipeline
   :width: 320px
   :height: 160px
   :align: center
   :class: architecture-diagram

   **Rspress** figure test with `inline code`.

.. list-table:: Frozen Delights!
   :widths: 15 10 30
   :header-rows: 1

   * - Treat
     - Quantity
     - Description
   * - Albatross
     - 2.99
     - **On a stick!**
   * - Crunchy Frog
     - `1.49`
     - If we took the bones out...

       It would not be crunchy, now would it?

## List table without header rows

.. list-table:: No header

   * - A
     - B
   * - C
     - D

## Ordinary Markdown table

| A | B |
|---|---|
| C | D |
