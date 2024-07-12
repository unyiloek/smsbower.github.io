<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order SMSBower</title>
    <!-- Bootstrap CSS -->
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/css/select2.min.css" rel="stylesheet" />
    <!-- Custom CSS -->
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="container mt-5">
        <h1 class="text-center mb-4">Order SMSBower</h1>
        <form id="orderForm" class="form-grid mb-4">
            <div class="form-group">
                <label for="service">Service:</label>
                <select id="service" name="service" class="form-control">
                    <?php include 'data/services.php'; ?>
                </select>
            </div>
            <div class="form-group">
                <label for="country">Country:</label>
                <select id="country" class="select2" style="width: 100%;">
    <?php
    include 'data/countries.php'; // Include the countries array
    foreach ($countries as $country => $value) {
        echo "<option value=\"$value\">$country</option>";
    }
    ?>
</select>
            </div>
            <div class="form-group">
                <label for="maxPrice">Max Price:</label>
                <input type="number" id="maxPrice" name="maxPrice" value="13" step="0.01" class="form-control">
            </div>
            <div class="form-group">
                <label for="quantity">Quantity:</label>
                <input type="number" id="quantity" name="quantity" value="5" min="1" class="form-control">
            </div>
            <button type="button" class="btn btn-primary" onclick="orderNumbers()">Order Numbers</button>
        </form>
        <div id="actions" class="actions mb-3">
            <button class="btn btn-danger cancel-all" onclick="cancelAll()">Cancel All</button>
            <button class="btn btn-success complete-all" onclick="completeAll()">Complete All</button>
        </div>
        <div id="result">
            <table id="orderTable" class="table table-bordered">
                <thead class="thead-dark">
                    <tr>
                        <th>#</th>
                        <th>ID</th>
                        <th>Number</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Table rows will be appended here -->
                </tbody>
            </table>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.11.0/umd/popper.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script>
    <script src="js/script.js"></script>
    <script>
    $(document).ready(function() {
        // Initialize Select2
        $('.select2').select2({
            placeholder: "Select a country",
            allowClear: true // Optional: allows clearing the selected value
        });

        // Set default value
        $('#country').val('31').trigger('change'); // Select South Africa by default
    });
</script>

</body>
</html>
