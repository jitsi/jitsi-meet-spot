Spot needs to support multiple resolutions. The Spot itself is intended to be displayed on a TV, whereas the remote controls are intended to be displayed on laptops, cell phones, and tables. Here are example of some common TV resolutions, for example:

4k: 3840 x 2160
HD: 1920 x 1080
1360 x 768

To accommodate such, media queries and em units are heavily used. All fonts and paddings that need to adjust with different widths should use ems. On the body, sizes are set based on media queries. So as the base sizes adjust, all attributes using ems should adjust. When needed, the media queries can be used directly to adjust the styling as needed for certain widths.
