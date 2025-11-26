<!-- File: admin/sidebar.php -->
<div id="admin-sidebar" dir="ltr">
    <h2 class="logo-text">MAH Admin</h2>
    <nav>
        <ul>
            <li class="<?= (basename($_SERVER['PHP_SELF']) == 'dashboard.php') ? 'active' : '' ?>">
                <a href="dashboard.php">Dashboard</a>
            </li>
            <li class="<?= (basename($_SERVER['PHP_SELF']) == 'orders.php') ? 'active'_
