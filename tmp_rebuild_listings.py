import pathlib

IG = {
    "Amara Venn": "amara_venn",
    "Luca Ferreira": "luca_ferreira",
    "Tumi on Wax": "tumionwax",
    "Signal Path Audio": "signalpathaudio",
    "Northlight Crew": "northlightcrew",
    "Mila Jacobs Photo": "milajacobsphoto",
    "Afterglow Films": "afterglowfilms",
    "The Glasshouse": "theglasshouse_ct",
    "Oak & Vine Estate": "oakandvine",
}
SC_DJ = {
    "Amara Venn": "amara-venn",
    "Luca Ferreira": "luca-ferreira",
    "Tumi on Wax": "tumi-on-wax",
}

def media(mid, img, alt, typ="image"):
    if typ != "image":
        return f'media("{mid}", "{img}", "{alt}", "{typ}")'
    return f'media("{mid}", "{img}", "{alt}")'

def listing(fields):
    lines = ["  {"]
    for i, (k, v) in enumerate(fields):
        comma = "," if i < len(fields) - 1 else ""
        lines.append(f"    {k}: {v}{comma}")
    lines.append("  },")
    return "\n".join(lines)

listings = []
