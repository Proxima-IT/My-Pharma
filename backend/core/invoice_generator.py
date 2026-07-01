import io
import os
from django.conf import settings
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_invoice_pdf(order) -> bytes:
    """
    Generates a clean, professional PDF invoice in-memory using ReportLab.
    Returns:
        bytes: The raw PDF file content.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    story = []

    # Palette
    PRIMARY_COLOR = colors.HexColor("#1D3583")  # Navy
    TEXT_COLOR = colors.HexColor("#333333")
    LIGHT_GRAY = colors.HexColor("#F9FAFB")
    BORDER_COLOR = colors.HexColor("#E5E7EB")
    ACCENT_COLOR = colors.HexColor("#10B981")  # Green

    # Styles
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        textColor=PRIMARY_COLOR,
        spaceAfter=5
    )
    
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=colors.HexColor("#666666"),
        spaceAfter=15
    )

    h2_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=PRIMARY_COLOR,
        spaceAfter=10
    )

    body_style = ParagraphStyle(
        'InvoiceBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=TEXT_COLOR,
        leading=14
    )

    bold_body_style = ParagraphStyle(
        'InvoiceBodyBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        textColor=colors.white
    )

    table_body_style = ParagraphStyle(
        'TableBody',
        parent=body_style,
        fontSize=9,
        leading=12
    )

    # Try to load custom logo from DB, fall back to static logo file
    logo_path = None
    try:
        from core.models import AppLogo
        app_logo = AppLogo.objects.filter(slug='header').first()
        if app_logo and app_logo.image:
            if os.path.exists(app_logo.image.path):
                logo_path = app_logo.image.path
    except Exception:
        pass

    if not logo_path:
        logo_path = os.path.join(settings.BASE_DIR, 'core', 'static', 'images', 'my-pharma-logo.png')

    logo_img = None
    if logo_path and os.path.exists(logo_path):
        try:
            # Scale logo to fit nicely. Original aspect ratio: 789 x 248 (~3.18)
            logo_img = Image(logo_path, width=120, height=38)
        except Exception:
            pass

    if logo_img:
        left_header = logo_img
    else:
        left_header = Paragraph("MY PHARMA", title_style)

    # Header section (Company Name/Logo & Invoice metadata)
    header_data = [
        [
            left_header,
            Paragraph(f"INVOICE #: {order.id}", ParagraphStyle('RightBold', parent=title_style, alignment=2, fontSize=16))
        ],
        [
            Paragraph("Your Trusted Online Healthcare Partner", subtitle_style),
            Paragraph(f"Date: {order.created_at.strftime('%Y-%m-%d %H:%M')}", ParagraphStyle('RightSub', parent=subtitle_style, alignment=2))
        ]
    ]
    
    header_table = Table(header_data, colWidths=[270, 260])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 20))

    # Divider
    divider = Table([[""]], colWidths=[530], rowHeights=[2])
    divider.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), PRIMARY_COLOR),
        ('PADDING', (0,0), (0,0), 0),
        ('BOTTOMPADDING', (0,0), (0,0), 0),
    ]))
    story.append(divider)
    story.append(Spacer(1, 20))

    # Billing & Shipping details
    customer = order.user
    full_name = getattr(customer, "username", "Valued Customer")
    # Resolve display name or details if address exists
    phone = customer.phone or "N/A"
    email = customer.email if customer.email and not customer.email.endswith("@ph.local") else "N/A"
    address_text = order.shipping_address or "N/A"

    info_data = [
        [
            Paragraph("Billed To:", h2_style),
            Paragraph("Order Status:", h2_style)
        ],
        [
            Paragraph(f"<b>Name:</b> {full_name}<br/><b>Phone:</b> {phone}<br/><b>Email:</b> {email}", body_style),
            Paragraph(f"<b>Status:</b> {order.get_status_display()}<br/><b>Payment:</b> Cash on Delivery", body_style)
        ],
        [
            Spacer(1, 10),
            Spacer(1, 10)
        ],
        [
            Paragraph("Shipping Address:", h2_style),
            ""
        ],
        [
            Paragraph(address_text.replace("\n", "<br/>"), body_style),
            ""
        ]
    ]

    info_table = Table(info_data, colWidths=[270, 260])
    info_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 25))

    # Line Items Table Header
    items_data = [
        [
            Paragraph("Item Details", table_header_style),
            Paragraph("Unit Size", table_header_style),
            Paragraph("Price", table_header_style),
            Paragraph("Qty", table_header_style),
            Paragraph("Total", table_header_style)
        ]
    ]

    # Populate Line Items
    for item in order.items.all():
        if item.product:
            prod_name = item.product.name
            unit_name = item.product.unit.name if item.product.unit else "N/A"
        elif item.combo:
            prod_name = item.combo.title
            unit_name = "Combo"
        else:
            prod_name = "Deleted Product"
            unit_name = "N/A"

        item_total = item.price_at_order * item.quantity
        items_data.append([
            Paragraph(prod_name, table_body_style),
            Paragraph(unit_name, table_body_style),
            Paragraph(f"TK {item.price_at_order}", table_body_style),
            Paragraph(str(item.quantity), table_body_style),
            Paragraph(f"TK {item_total}", table_body_style)
        ])

    items_table = Table(items_data, colWidths=[230, 90, 80, 50, 80])
    
    # Base table styling
    t_style = [
        ('BACKGROUND', (0,0), (-1,0), PRIMARY_COLOR),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,0), 8),
        ('BOTTOMPADDING', (0,0), (-1,0), 8),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
    ]

    # Alternating row background colors
    for i in range(1, len(items_data)):
        bg = LIGHT_GRAY if i % 2 == 0 else colors.white
        t_style.append(('BACKGROUND', (0, i), (-1, i), bg))
        t_style.append(('TOPPADDING', (0, i), (-1, i), 6))
        t_style.append(('BOTTOMPADDING', (0, i), (-1, i), 6))

    items_table.setStyle(TableStyle(t_style))
    story.append(items_table)
    story.append(Spacer(1, 20))

    # Financial Breakdown / Summary
    summary_data = [
        [Paragraph("Subtotal:", body_style), Paragraph(f"TK {order.subtotal_before_discount}", body_style)],
        [Paragraph("Discount Amount:", body_style), Paragraph(f"- TK {order.discount_amount}", body_style)],
        [Paragraph("Delivery Fee:", body_style), Paragraph(f"+ TK {order.delivery_fee}", body_style)],
        [Paragraph("Total Amount:", bold_body_style), Paragraph(f"TK {order.total}", bold_body_style)]
    ]
    
    summary_table = Table(summary_data, colWidths=[120, 100])
    summary_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor("#EBF5FF")), # Highlight Grand Total
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))

    # Wrap summary table in a container to push it to the right
    wrapper_data = [["", summary_table]]
    wrapper_table = Table(wrapper_data, colWidths=[310, 220])
    wrapper_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(wrapper_table)
    story.append(Spacer(1, 40))

    # Footer
    footer_text = Paragraph(
        "<center>Thank you for choosing My Pharma! If you have any inquiries regarding this invoice, "
        "please contact support at support@mypharma.com or call 09612-XXXXXX.</center>",
        ParagraphStyle('FooterText', parent=body_style, fontSize=8, textColor=colors.HexColor("#999999"))
    )
    story.append(footer_text)

    # Build the document
    doc.build(story)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
